import { JobDefinition } from "../lib/core/job-registry";
import { vectorStore } from "@self-learning/rag-processing";
import { ragRetrievePayloadSchema } from "@self-learning/worker-api";

/**
 * RAG Retrieval Job
 *
 * Performs vector similarity search in worker thread.
 * This is necessary because embedding generation requires
 * heavy computation that doesn't work in Next.js API routes.
 */
export const ragRetrieveJob: JobDefinition<"ragRetrieve"> = {
	name: "ragRetrieve",
	description: "Retrieves relevant context for a question using vector search",
	schema: ragRetrievePayloadSchema,

	run: async payload => {
		const { lessonId, question, topK } = payload;
		console.log("[RagRetrieve] Searching for context", {
			lessonId,
			question: question.substring(0, 50),
			topK
		});

		try {
			// Check if lesson exists
			const exists = await vectorStore.lessonExists(lessonId);
			if (!exists) {
				console.log("[RagRetrieve] Lesson not found in vector store", { lessonId });
				return { 
					context: "No relevant content found for lesson data.",
					sources: []
				};
			}
			// Perform vector search (generates embeddings internally)
			const results = await vectorStore.search(lessonId, question, topK);
			if (results.length === 0) {
				console.log("[RagRetrieve] No relevant results found", { lessonId });
				return { 
					context: "No relevant content found for this question.",
					sources: []
				};
			}
			// Format context
			const context = results
				.map((result, idx) => {
					const source = result.metadata.lessonName;
					const page = result.metadata.pageNumber
						? ` (Page ${result.metadata.pageNumber})`
						: "";
					return `[Source ${idx + 1}: ${source}${page}]\n${result.text}`;
				})
				.join("\n\n---\n\n");

			console.log("[RagRetrieve] Context retrieved successfully", {
				lessonId,
				resultsCount: results.length
			});

			return {
				context,
				sources: results.map(r => ({
					lessonName: r.metadata.lessonName,
					pageNumber: r.metadata.pageNumber,
					sourceType: r.metadata.sourceType,
					score: r.score
				}))
			};
		} catch (error) {
			console.error("[RagRetrieve] Retrieval failed", error, { lessonId });
			throw error;
		}
	}
};
