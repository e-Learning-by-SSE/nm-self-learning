import { TRPCError } from "@trpc/server";
import { authProcedure, t } from "../trpc";
import { database } from "@self-learning/database";
import { z } from "zod";
import { Message } from "@self-learning/ai-tutor";
import { sendChatRequest, LlmConfig } from "../../llm/openai_api_handler";

const evaluateInputSchema = z.object({
	questionStatement: z.string().trim().min(1, "Question statement is required."),
	solutionOrConcepts: z
		.string()
		.trim()
		.min(1, "Solution or concepts must be configured before evaluation."),
	passingThreshold: z.number().int().min(0).max(100),
	studentAnswer: z.string().trim().min(1, "Student answer cannot be empty.")
});

// The router always resolves — never rejects. On any failure, ok: false is returned
// so the client (evaluate.ts) can handle it without try/catch or onError wiring.
const evaluateOutputSchema = z.discriminatedUnion("ok", [
	z.object({
		ok: z.literal(true),
		verdict: z.enum(["correct", "partially-correct", "partially-wrong", "wrong"]),
		feedback: z.string()
	}),
	z.object({
		ok: z.literal(false)
	})
]);

const parsedResponseSchema = z.object({
	verdict: z.enum(["correct", "partially-correct", "partially-wrong", "wrong"]),
	feedback: z.string()
});

/**
 * Evaluates a student's free-text answer using the configured LLM.
 *
 * * The router is responsible for:
 *  1. Fetching the LLM config from the database
 *  2. Building the system prompt (security-sensitive: must never leak the solution)
 *  3. Building the user message with all evaluation context
 *  4. Calling the LLM with temperature 0
 *  5. Parsing and validating the structured JSON response
 *  6. Returning a typed result or an error state without throwing
 */

export const textEvaluationRouter = t.router({
	evaluate: authProcedure
		.input(evaluateInputSchema)
		.output(evaluateOutputSchema)
		.mutation(async ({ input }) => {
			// Step 1: Fetch LLM configuration from DB
			const llmConfig = await fetchLlmConfig();
			if (!llmConfig) {
				return { ok: false as const };
			}

			// Step 2: Build system prompt — evaluation-specific, never reveals solution
			const systemPrompt = buildSystemPrompt();

			// Step 3: Build user message with all dynamic content
			const userMessage = buildUserMessage(input);
			const messages: Message[] = [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: userMessage }
			];

			// Step 4: Send request to LLM server and get raw response
			const rawContent = await sendChatRequest(messages, llmConfig);

			if (!rawContent) {
				return { ok: false as const };
			}

			// Step 5: Parse and validate LLM response against expected schema
			const parsed = parseLlmResponse(rawContent);

			if (!parsed) {
				return { ok: false as const };
			}

			return { ok: true as const, ...parsed };
		}),

	/**
	 * Returns whether an LLM config exists on the platform.
	 * Used by form.tsx to decide whether to render the AI evaluation fields.
	 */
	checkLlmConfig: authProcedure.output(z.object({ available: z.boolean() })).query(async () => {
		const config = await database.llmConfiguration.findFirst({
			where: { isActive: true },
			select: { serverUrl: true }
		});
		return { available: !!config };
	})
});

/**
 * Builds the system prompt for the LLM evaluator.
 * Static prompt, all dynamic content goes in buildUserMessage().
 */
function buildSystemPrompt(): string {
	return `You are a strict but fair academic evaluator for an e-learning platform.
Your task is to evaluate a student's free-text answer to an open question.

You will receive:
- The question text
- An evaluation reference (either a sample solution or a list of expected concepts with percentage weights)
- A passing threshold (0–100 %)
- The student's answer

## Your task
1. Read the student's answer carefully.
2. Compare it against the evaluation reference to judge how well the student addressed the question.
3. Choose the appropriate verdict based on the coverage and correctness of the student's answer:
   - "correct": The student fully understood and addressed the question. Coverage meets or exceeds the passing threshold.
   - "partially-correct": Meaningful understanding shown, but some important aspects are missing. Coverage is close to but just below the threshold.
   - "partially-wrong": Some relevant knowledge shown, but significant parts are incorrect or missing.
   - "wrong": The answer does not address the question, is off-topic, or is too vague to evaluate.
4. Write a short feedback (1–3 sentences) that explains your verdict.

## CRITICAL RULES — you must follow all of these without exception
- NEVER reveal, hint at, paraphrase, or quote any part of the sample solution or the expected concepts in your feedback.
- Your feedback must ONLY comment on what the student actually wrote — their own words, reasoning, and ideas.
- Do NOT tell the student what the correct answer is or what they are missing in terms of content.
- Write your feedback in the SAME LANGUAGE as the question.
- You decide whether the student passes based on the passing threshold. Do NOT ask the caller to decide.
- Respond ONLY with a single valid JSON object. No explanation, no markdown, no code fences, no preamble.

## Required JSON format (respond with exactly this structure, nothing else)
{"verdict": "<correct|partially-correct|partially-wrong|wrong>", "feedback": "<your feedback here>"}`;
}

/**
 * Builds the user-role message containing all four evaluation context pieces.
 * question text, evaluation reference, threshold, and student answer.
 */
function buildUserMessage(input: z.infer<typeof evaluateInputSchema>): string {
	return `## Question
${input.questionStatement}

## Evaluation Reference
${input.solutionOrConcepts}

## Passing Threshold
${input.passingThreshold}%

## Student's Answer
${input.studentAnswer}`;
}

/**
 * Parses the raw string returned by the LLM into a typed { verdict, feedback } object.
 *
 * Some LLMs wrap JSON in markdown fences despite being told not to.
 * We strip those before parsing, then validate against the output schema.
 */
function parseLlmResponse(rawContent: string): z.infer<typeof parsedResponseSchema> | null {
	const cleaned = rawContent.replace(/```json|```/gi, "").trim();

	try {
		const parsed = JSON.parse(cleaned);
		const result = parsedResponseSchema.safeParse(parsed);
		if (!result.success) {
			return null;
		}
		return result.data;
	} catch {
		return null;
	}
}

// Returns null instead of throwing when no config exists.
async function fetchLlmConfig(): Promise<LlmConfig | null> {
	return await database.llmConfiguration.findFirst({
		where: { isActive: true },
		select: { serverUrl: true, apiKey: true, defaultModel: true }
	});
}
