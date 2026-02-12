import { JobDefinition } from "../lib/core/job-registry";
import { ragEmbedPayloadSchema } from "@self-learning/worker-api";
import { 
	contentProcessor,
	vectorStore,
	IngestionResult 
} from "@self-learning/rag-processing";

/**
 * RAG Embedding Job
 *
 * Processes lesson content and generates embeddings for vector search.
 *
 * This job performs CPU-intensive operations:
 * - PDF text extraction and parsing
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
		const { lessonId, lessonTitle, pdfBuffers, articleTexts, transcriptTexts } = payload;

		console.log("[RagService] Starting RAG embed job", { lessonTitle });

		try {
			// Step 1: Check if lesson already exists and delete if so
			const exists = await vectorStore.lessonExists(lessonId);
			if (exists) {
				console.log("[RagService] Lesson already exists, deleting old data", { lessonId });
				await vectorStore.deleteLesson(lessonId);
			}

			// Step 2: Process PDFs into chunks
			let pdfChunks = 0;
			if (pdfBuffers.length > 0) {
				console.log("[RagService] Processing PDF buffers", { count: pdfBuffers.length });
				const chunks = await contentProcessor.processMultiplePDFs(
					pdfBuffers,
					lessonId,
					lessonTitle
				);
				pdfChunks = chunks.length;

				// Add to vector store
				if (chunks.length > 0) {
					await vectorStore.addDocuments(lessonId, chunks);
				}
			}

			// Step 3: Process articles into chunks
			let articleChunks = 0;
			if (articleTexts.length > 0) {
				console.log("[RagService] Processing articles", { count: articleTexts.length });
				const chunks = await contentProcessor.processArticles(
					articleTexts,
					lessonId,
					lessonTitle
				);
				articleChunks = chunks.length;

				// Add to vector store
				if (chunks.length > 0) {
					await vectorStore.addDocuments(lessonId, chunks);
				}
			}

			// Step 4: Process video transcripts into chunks
			let videoChunks = 0;
			if (transcriptTexts.length > 0) {
				console.log("[RagService] Processing video transcripts", {
					count: transcriptTexts.length
				});
				const chunks = await contentProcessor.processVideoTranscripts(
					transcriptTexts,
					lessonId,
					lessonTitle
				);
				videoChunks = chunks.length;

				// Add to vector store
				if (chunks.length > 0) {
					await vectorStore.addDocuments(lessonId, chunks);
				}
			}

			// Step 5: Prepare result
			const totalChunks = pdfChunks + articleChunks + videoChunks;

			if (totalChunks === 0) {
				throw new Error("No content chunks were created. Please check lesson content.");
			}

			const result: IngestionResult = {
				success: true,
				chunksCreated: totalChunks,
				breakdown: { 
					pdfChunks, 
					articleChunks, 
					videoChunks 
				},
				message: `Successfully ingested lesson with ${totalChunks} chunks`
			};

			console.log("[RagService] RAG embed job completed successfully", {
				lessonId,
				lessonTitle,
				...result.breakdown,
				totalChunks
			});

			return result;
		} catch (error) {
			console.error("[RagService] RAG embed job failed", error, { lessonId, lessonTitle });
			throw error;
		}
	}
};
