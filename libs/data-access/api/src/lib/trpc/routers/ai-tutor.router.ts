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
import { sendChatRequest } from "../../llm/openai_api_handler";

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

				// Step 4: Fetch context using RAG service only for lesson pages
				let context = "";
				if (contextPayload?.type === "lesson") {
					context = await retrieveContext(contextPayload.lessonId, userQuestion).then(
						res => res.context
					);
				}

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

async function fetchLlmConfig() {
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
