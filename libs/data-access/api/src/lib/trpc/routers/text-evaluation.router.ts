import { TRPCError } from "@trpc/server";
import { authProcedure, t } from "../trpc";
import { database } from "@self-learning/database";
import { z } from "zod";
interface LlmConfig {
	serverUrl: string;
	apiKey: string | null;
	defaultModel: string;
}

type Message = {
	role: "system" | "user";
	content: string;
};

const llmApiResponseSchema = z.object({
	message: z.object({
		content: z.string(),
		role: z.string()
	})
});

const evaluateInputSchema = z.object({
	questionStatement: z.string().min(1),
	solutionOrConcepts: z.string().min(1),
	passingThreshold: z.number().int().min(0).max(100),
	studentAnswer: z.string().min(1)
});

const evaluateOutputSchema = z.object({
	verdict: z.enum(["correct", "partially-correct", "partially-wrong", "wrong"]),
	feedback: z.string()
});

export const textEvaluationRouter = t.router({
	/**
	 * Evaluates a student's free-text answer using the configured LLM.
	 *
	 * The router is responsible for:
	 *  1. Fetching the LLM config from the database
	 *  2. Building the system prompt (security-sensitive: must never leak the solution)
	 *  3. Building the user message with all evaluation context
	 *  4. Calling the LLM with temperature 0
	 *  5. Parsing and validating the structured JSON response
	 *  6. Returning a typed { verdict, feedback } object
	 *
	 * All LLM communication errors are re-thrown as TRPCErrors so the client
	 * (component.tsx) can catch them uniformly and show the fallback message.
	 */
	evaluate: authProcedure
		.input(evaluateInputSchema)
		.output(evaluateOutputSchema)
		.mutation(async ({ input, ctx }) => {
			// Step 1: Fetch LLM configuration from DB
			// Throws NOT_FOUND if no config exists — caught by component.tsx
			const llmConfig = await fetchLlmConfig();

			// Step 2: Build system prompt — evaluation-specific, never reveals solution
			const systemPrompt = buildSystemPrompt();

			// Step 3: Build the user message with all four required pieces of context
			const userMessage = buildUserMessage(input);

			// Step 4: Send to LLM and get raw response string
			const messages: Message[] = [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: userMessage }
			];

			const rawContent = await sendEvaluationRequest(messages, llmConfig);

			// Step 5: Parse and validate the structured JSON the LLM returned
			const parsed = parseLlmResponse(rawContent);

			console.info("[TextEvaluationRouter] Evaluation complete", {
				questionLength: input.questionStatement.length,
				answerLength: input.studentAnswer.length,
				verdict: parsed.verdict,
				username: ctx.user.name
			});

			return parsed;
		}),

	/**
	 * Checks whether an LLM configuration exists on the platform.
	 * Used by form.tsx (teacher editor) to decide whether to enable the AI toggle (FR-05).
	 *
	 * Returns { available: true } if a config row exists, { available: false } otherwise.
	 * Never throws — a missing config is a valid state, not an error.
	 */
	checkLlmConfig: authProcedure.output(z.object({ available: z.boolean() })).query(async () => {
		const config = await database.llmConfiguration.findFirst({
			select: { serverUrl: true }
		});
		return { available: !!config };
	})
});

/**
 * Builds the system prompt for the LLM evaluator.
 *
 * Security rules encoded here:
 *  - Must NEVER reveal, hint at, paraphrase, or quote the sample solution
 *  - Feedback must only address what the student actually wrote
 *
 * Evaluation rules:
 *  - LLM decides pass/fail itself based on the threshold — we do not decide for it
 *  - Response must be pure JSON with exactly the fields { verdict, feedback }
 *  - Feedback must be in the same language as the question
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
   - "partially-wrong": Some relevant knowledge shown, but significant parts incorrect.
   - "wrong": The answer does not address the question, is off-topic, or is too vague to evaluate.
4. Write a short feedback (1–3 sentences) that explains your verdict.

## CRITICAL RULES — you must follow all of these without exception
- NEVER reveal, hint at, paraphrase, or quote any part of the sample solution or the expected concepts in your feedback.
- Your feedback must ONLY comment on what the student actually wrote — their own words, reasoning, and ideas.
- Do NOT tell the student what the correct answer is or what they are missing in terms of content.
- Write your feedback in the SAME LANGUAGE as the question.
- You decide whether the student passes based on the passing threshold. Do NOT ask the caller to decide.
- Respond ONLY with a single valid JSON object. No explanation, no markdown, no code fences, no preamble.

## Required JSON format (respond with exactly this structure)
{"verdict": "<correct|partially-correct|partially-wrong|wrong>", "feedback": "<your feedback here>"}`;
}

/**
 * Builds the user-role message containing all four evaluation context pieces.
 * question text, evaluation reference, threshold, and student answer must all be present.
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
 * Sends the evaluation request to the LLM server.
 *
 * Key differences from the AI Tutor's sendChatRequest:
 *  - temperature: 0  (deterministic, reproducible results)
 *  - maxTokens: 300  (feedback is short: 1–3 sentences)
 *  - No streaming
 *
 * Throws TRPCError on any failure (timeout, HTTP error, invalid response shape).
 * The caller (evaluate procedure) propagates these to the client, which shows
 * the unified fallback message.
 */
async function sendEvaluationRequest(messages: Message[], config: LlmConfig): Promise<string> {
	const TIMEOUT_MS = 30_000;

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

	try {
		const response = await fetch(`${config.serverUrl}/chat`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {})
			},
			body: JSON.stringify({
				messages,
				model: config.defaultModel,
				stream: false,
				temperature: 0, // must be 0 for evaluation
				maxTokens: 300 // short feedback only
			}),
			signal: controller.signal
		});

		clearTimeout(timeout);

		if (!response.ok) {
			throw handleHttpError(response.status);
		}

		const data = await response.json();
		const validated = llmApiResponseSchema.safeParse(data);

		if (!validated.success) {
			console.error("[TextEvaluationRouter] Invalid LLM response format", {
				errors: validated.error
			});
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Invalid response format from LLM server"
			});
		}

		return validated.data.message.content;
	} catch (error) {
		clearTimeout(timeout);

		if (error instanceof TRPCError) {
			throw error;
		}

		if (error instanceof Error && error.name === "AbortError") {
			console.error("[TextEvaluationRouter] LLM request timed out");
			throw new TRPCError({
				code: "TIMEOUT",
				message: "LLM server request timed out"
			});
		}

		console.error("[TextEvaluationRouter] Unexpected error during LLM call", error);
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "Failed to communicate with LLM server"
		});
	}
}

/**
 * Parses the raw string returned by the LLM into a typed { verdict, feedback } object.
 *
 * The LLM is instructed to return pure JSON, but it may still occasionally wrap
 * the response in markdown code fences despite the instruction. We strip those
 * before parsing.
 *
 * Throws INTERNAL_SERVER_ERROR if the JSON is unparseable or the verdict is not
 * one of the four allowed values. The evaluate procedure propagates this to the
 * client.
 */
function parseLlmResponse(rawContent: string): z.infer<typeof evaluateOutputSchema> {
	// Strip possible markdown code fences the LLM may add despite instructions
	const cleaned = rawContent.replace(/```json|```/gi, "").trim();

	let parsed: unknown;
	try {
		parsed = JSON.parse(cleaned);
	} catch {
		console.error("[TextEvaluationRouter] LLM response is not valid JSON", {
			rawContent
		});
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "LLM returned an unparseable response"
		});
	}

	// Validate against the output schema — catches wrong verdict values, missing fields, etc.
	const result = evaluateOutputSchema.safeParse(parsed);

	if (!result.success) {
		console.error("[TextEvaluationRouter] LLM response failed schema validation", {
			errors: result.error.flatten(),
			rawContent
		});
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "LLM returned a response with an unexpected structure"
		});
	}

	return result.data;
}

/**
 * Fetches the LLM configuration from the database.
 * Throws NOT_FOUND if no configuration has been set up.
 * Same pattern as fetchLlmConfig() in ai-tutor.router.ts.
 */
async function fetchLlmConfig(): Promise<LlmConfig> {
	const config = await database.llmConfiguration.findFirst({
		select: {
			serverUrl: true,
			apiKey: true,
			defaultModel: true
		}
	});

	if (!config) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message:
				"LLM configuration not found. Please configure an LLM server in the admin settings."
		});
	}

	return config;
}

const errorMap: Record<number, { code: TRPCError["code"]; message: string }> = {
	400: { code: "BAD_REQUEST", message: "Invalid request to LLM server" },
	401: { code: "UNAUTHORIZED", message: "LLM API authentication failed" },
	403: { code: "FORBIDDEN", message: "Access to LLM API forbidden" },
	404: { code: "NOT_FOUND", message: "LLM API endpoint not found" },
	429: { code: "TOO_MANY_REQUESTS", message: "LLM API rate limit exceeded" },
	500: { code: "INTERNAL_SERVER_ERROR", message: "LLM server internal error" },
	502: { code: "BAD_GATEWAY", message: "LLM server unavailable" },
	503: { code: "SERVICE_UNAVAILABLE", message: "LLM server temporarily unavailable" }
};

function handleHttpError(status: number): TRPCError {
	const error = errorMap[status] ?? errorMap[500];
	return new TRPCError({ code: error.code, message: error.message });
}
