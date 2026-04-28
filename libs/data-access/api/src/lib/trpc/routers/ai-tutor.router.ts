import { TRPCError } from "@trpc/server";
import { authProcedure, t } from "../trpc";
import { database, logJobProgress } from "@self-learning/database";
import {
	extractUserQuestion,
	fetchContextPayload,
	buildSystemPrompt,
	cleanResponse,
	aiTutorRequestSchema,
	Message
} from "@self-learning/ai-tutor";
import { RagRetrievalResult } from "@self-learning/rag-processing";
import { workerServiceClient } from "@self-learning/worker-api";
import crypto from "crypto";
import { z } from "zod";

const aiTutorResponseSchema = z.object({
	content: z.string(),
	timestamp: z.date()
});

export const aiTutorRouter = t.router({
	sendMessage: authProcedure
		.input(aiTutorRequestSchema)
		.output(aiTutorResponseSchema)
		.mutation(async ({ input, ctx }) => {
			try {
				// Step 1: Fetch LLM configuration
				const llmConfig = await fetchLlmConfig();

				// Step 2: Extract user question
				const userQuestion = extractUserQuestion(input.messages);

				// Step 3: Fetch AI-Tutor location, either opened in course page or in lesson page
				const contextPayload = await fetchContextPayload(input.pageContext);

				// Step 4: Fetch context using RAG service with lessonID
				const { context } = await retrieveContext(
					contextPayload?.type === "lesson" ? contextPayload.lessonId : "",
					userQuestion
				);

				// Step 5: Build system prompt
				const systemPrompt = await buildSystemPrompt(contextPayload, context);

				// Step 6: Inject fresh system prompt into the message history
				const messages = injectSystemPrompt(input.messages, systemPrompt);

				// Step 7: Send request to LLM
				const rawResponse = await sendChatRequest(messages, llmConfig);

				// Step 8: Clean and format response
				const cleanedResponse = cleanResponse(rawResponse);

				return {
					content: cleanedResponse,
					timestamp: new Date()
				};
			} catch (error) {
				if (error instanceof TRPCError) {
					console.error("[AiTutorRouter] TRPC error", {
						code: error.code,
						message: error.message,
						username: ctx.user.name
					});
					throw error;
				}

				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to process AI tutor request"
				});
			}
		})
});

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
			message: "LLM configuration not found"
		});
	}

	return config;
}

/**
 * Send a chat request to the LLM server with the given messages and configuration.
 *
 * This function handles the communication with the LLM server, including error handling and response validation.
 * It sends a POST request to the LLM server's /chat endpoint with the conversation history and configuration parameters.
 * The response is expected to contain a message object with the assistant's reply, which is then validated against a schema.
 * If the response format is invalid or if there are any communication errors, appropriate TRPC errors are thrown.
 */

const llmApiResponseSchema = z.object({
	message: z.object({
		content: z.string(),
		role: z.string()
	})
});

interface LlmConfig {
	serverUrl: string;
	apiKey: string | null;
	defaultModel: string;
}

async function sendChatRequest(messages: Message[], config: LlmConfig): Promise<string> {
	const TIMEOUT_MS = 30000; // 30 seconds timeout for LLM response
	try {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

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
				temperature: 0.7,
				maxTokens: 2000,
				timeout: TIMEOUT_MS
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
			console.error("[LlmClientService] Invalid LLM response format", {
				errors: validated.error
			});
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Invalid response format from LLM server"
			});
		}
		return validated.data.message.content;
	} catch (error) {
		if (error instanceof TRPCError) {
			throw error;
		}

		if (error instanceof Error && error.name === "AbortError") {
			console.error("[LlmClientService] Request timeout");
			throw new TRPCError({
				code: "TIMEOUT",
				message: "LLM server request timed out"
			});
		}
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "Failed to communicate with LLM server"
		});
	}
}

function handleHttpError(status: number): TRPCError {
	const error = errorMap[status] || errorMap[500];
	return new TRPCError({
		code: error.code,
		message: error.message
	});
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

/**
 * Inject (or replace) the system prompt in the message array.
 *
 * The system prompt is rebuilt from scratch on every request with fresh RAG context,
 * so any existing system message from the conversation history must be replaced —
 * not appended — to avoid stale or duplicate instructions reaching the LLM.
 *
 * Single-pass implementation: replaces in-place if a system message exists,
 * otherwise prepends a new one.
 */
function injectSystemPrompt(messages: Message[], systemPrompt: string): Message[] {
	let wasReplaced = false;

	const updated = messages.map(msg => {
		if (msg.role === "system") {
			wasReplaced = true;
			return { ...msg, content: systemPrompt };
		}
		return msg;
	});

	if (!wasReplaced) {
		return [{ role: "system" as const, content: systemPrompt }, ...messages];
	}

	return updated;
}

async function retrieveContext(
	lessonId: string,
	question: string,
	topK = 5
): Promise<RagRetrievalResult> {
	try {
		const jobId = crypto.randomUUID();

		// Submit retrieval job to worker
		await workerServiceClient.submitJob.mutate({
			jobId,
			jobType: "ragRetrieve",
			payload: { lessonId, question, topK }
		});

		// Subscribe and write result to DB when finished
		subscribeToRagRetrieveJob(jobId);

		// Poll DB until job finishes (non-blocking per request cycle, max 30s)
		return await pollRagResult(jobId);
	} catch (error) {
		console.error("[RagService] Failed to retrieve context", {
			lessonId,
			error: error instanceof Error ? error.message : error
		});
		return {
			context: "Unable to retrieve lesson context at this time.",
			sources: []
		};
	}
}

function subscribeToRagRetrieveJob(jobId: string): void {
	workerServiceClient.jobQueue.subscribe(
		{ jobId },
		{
			onData: async event => {
				if (event.status === "finished") {
					const result = event.result as RagRetrievalResult;
					await logJobProgress(jobId, event, JSON.stringify(result));
				} else {
					await logJobProgress(jobId, event);
				}
			},
			onError: error => {
				console.error("[AiTutor] RAG retrieve subscription error", {
					jobId,
					error: error instanceof Error ? error.message : String(error)
				});
			}
		}
	);
}

async function pollRagResult(
	jobId: string,
	timeoutMs = 30000,
	intervalMs = 300
): Promise<RagRetrievalResult> {
	const deadline = Date.now() + timeoutMs;

	while (Date.now() < deadline) {
		const job = await database.jobQueue.findUnique({ where: { id: jobId } });

		if (job?.status === "FINISHED" && job.context) {
			return JSON.parse(job.context);
		}
		if (job?.status === "ABORTED") {
			throw new Error(`RAG retrieval failed: ${job.cause}`);
		}

		await new Promise(res => setTimeout(res, intervalMs));
	}

	throw new Error("RAG retrieval timed out after 30 seconds");
}
