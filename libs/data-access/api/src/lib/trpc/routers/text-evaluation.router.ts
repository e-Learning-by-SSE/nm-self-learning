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
	questionStatement: z.string().trim().min(1, "Question statement is required."),
	solutionOrConcepts: z
		.string()
		.trim()
		.min(1, "Solution or concepts must be configured before evaluation."),
	passingThreshold: z.number().int().min(0).max(100),
	studentAnswer: z.string().trim().min(1, "Student answer cannot be empty.")
});

const evaluateOutputSchema = z.object({
	verdict: z.enum(["correct", "partially-correct", "partially-wrong", "wrong"]),
	feedback: z.string()
});

export const textEvaluationRouter = t.router({
	evaluate: authProcedure
		.input(evaluateInputSchema)
		.output(evaluateOutputSchema)
		.mutation(async ({ input, ctx }) => {
			const llmConfig = await fetchLlmConfig();
			const messages: Message[] = [
				{ role: "system", content: buildSystemPrompt() },
				{ role: "user", content: buildUserMessage(input) }
			];
			const rawContent = await sendEvaluationRequest(messages, llmConfig);
			const parsed = parseLlmResponse(rawContent);

			console.info("[TextEvaluationRouter] Evaluation complete", {
				questionLength: input.questionStatement.length,
				answerLength: input.studentAnswer.length,
				verdict: parsed.verdict,
				username: ctx.user.name
			});

			return parsed;
		}),

	checkLlmConfig: authProcedure.output(z.object({ available: z.boolean() })).query(async () => {
		const config = await database.llmConfiguration.findFirst({
			where: { isActive: true },
			select: { serverUrl: true }
		});
		return { available: !!config };
	})
});

/**
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
				temperature: 0,
				maxTokens: 300
			}),
			signal: controller.signal
		});

		clearTimeout(timeout);

		if (!response.ok) throw handleHttpError(response.status);

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
		if (error instanceof TRPCError) throw error;
		if (error instanceof Error && error.name === "AbortError") {
			throw new TRPCError({ code: "TIMEOUT", message: "LLM server request timed out" });
		}
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "Failed to communicate with LLM server"
		});
	}
}

/**
 * Some LLMs wrap JSON in markdown fences despite being told not to.
 * We strip those before parsing, then validate against the output schema.
 */
function parseLlmResponse(rawContent: string): z.infer<typeof evaluateOutputSchema> {
	const cleaned = rawContent.replace(/```json|```/gi, "").trim();

	let parsed: unknown;
	try {
		parsed = JSON.parse(cleaned);
	} catch {
		console.error("[TextEvaluationRouter] LLM response is not valid JSON", { rawContent });
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "LLM returned an unparseable response"
		});
	}

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

async function fetchLlmConfig(): Promise<LlmConfig> {
	const config = await database.llmConfiguration.findFirst({
		where: { isActive: true },
		select: { serverUrl: true, apiKey: true, defaultModel: true }
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
