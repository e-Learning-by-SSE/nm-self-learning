import { TRPCError } from "@trpc/server";
import { authProcedure, t } from "../trpc";
import { database } from "@self-learning/database";
import {
	aiTutorRequestSchema,
	aiTutorResponseSchema,
	Message,
	LlmConfig
} from "@self-learning/types";
import { aiTutorService, llmClientService } from "@self-learning/ai-tutor";
import { workerServiceClient } from "@self-learning/worker-api";
import crypto from "crypto";

export const aiTutorRouter = t.router({
	sendMessage: authProcedure
		.input(aiTutorRequestSchema)
		.output(aiTutorResponseSchema)
		.mutation(async ({ input, ctx }) => {
			try {
				const llmConfig = await fetchLlmConfig();
				const userQuestion = aiTutorService.extractUserQuestion(input.messages);
				const contextPayload = await aiTutorService.fetchContextPayload(input.pageContext);
				const { context, sources } = await retrieveContext(
					contextPayload?.type === "lesson" ? contextPayload.lessonId : "",
					userQuestion
				);
				const systemPrompt = await aiTutorService.buildSystemPrompt(
					contextPayload,
					userQuestion,
					context
				);
				const messages = prepareMessages(input.messages, systemPrompt);
				const rawResponse = await llmClientService.sendChatRequest(messages, llmConfig);
				const cleanedResponse = aiTutorService.cleanResponse(rawResponse);
				const validatedSources = sources.map(source => ({
					...source,
					sourceType: (["pdf", "article", "video"].includes(source.sourceType || "")
						? source.sourceType
						: undefined) as "pdf" | "article" | "video" | undefined
				}));

				return {
					content: cleanedResponse,
					sources: validatedSources,
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

function prepareMessages(messages: Message[], systemPrompt: string): Message[] {
	const hasSystemMessage = messages.some(msg => msg.role === "system");

	if (hasSystemMessage) {
		return messages.map(msg =>
			msg.role === "system" ? { ...msg, content: systemPrompt } : msg
		);
	}

	return [
		{ 
			role: "system" as const,
			content: systemPrompt
		},
		...messages
	];
}

async function retrieveContext(
	lessonId: string,
	question: string,
	topK = 5
): Promise<{ context: string; sources: any[] }> {
	console.log("[RagService] Retrieving context via worker", {
		lessonId,
		question: question.substring(0, 50),
		topK
	});

	try {
		const jobId = crypto.randomUUID();

		// Submit retrieval job to worker
		await workerServiceClient.submitJob.mutate({
			jobId,
			jobType: "ragRetrieve",
			payload: { lessonId, question, topK }
		});

		console.log("[RagService] Retrieval job submitted", { jobId });

		// Wait for result synchronously using subscription
		const result = await new Promise<{ context: string; sources: any[] }>((resolve, reject) => {
			const timeout = setTimeout(() => {
				reject(new Error("RAG retrieval timed out after 30 seconds"));
			}, 30000);

			workerServiceClient.jobQueue.subscribe(
				{ jobId },
				{
					onData: event => {
						if (event.status === "finished") {
							clearTimeout(timeout);
							resolve(event.result as { context: string; sources: any[] });
						} else if (event.status === "aborted") {
							clearTimeout(timeout);
							reject(new Error(`RAG retrieval failed: ${event.cause}`));
						}
					},
					onError: error => {
						clearTimeout(timeout);
						reject(error);
					}
				}
			);
		});

		console.log("[RagService] Context retrieved successfully", {
			lessonId,
			resultsCount: result.sources.length
		});

		return result;
	} catch (error) {
		console.error("[RagService] Failed to retrieve context", error, { lessonId });
		return { context: "Unable to retrieve lesson context at this time.", sources: [] };
	}
}
