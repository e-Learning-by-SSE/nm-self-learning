import { JobDefinition } from "../lib/core/job-registry";
import { ragEmbedPayloadSchema } from "@self-learning/worker-api";
import { processRagEmbedLesson } from "@self-learning/rag-processing";

/**
 * RAG Embedding Job
 *
 * Processes lesson content and generates embeddings for vector search.
 *
 * This job performs CPU-intensive operations:
 * - PDF text extraction and parsing
 * - Article text processing
 * - Video transcript processing
 * - HTML content processing
 * - H5P content processing
 * - Text chunking
 * - Embedding generation
 * - Vector store operations
 *
 * Note: All I/O operations (PDF downloads, database queries) are done in the API layer.
 */
export const ragEmbedJob: JobDefinition<"ragEmbed"> = {
	name: "ragEmbed",
	description: "Processes and embeds lesson content into vector store",
	schema: ragEmbedPayloadSchema,

	run: async payload => {
		return processRagEmbedLesson(payload);
	}
};
