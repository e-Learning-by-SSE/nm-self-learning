import { JobDefinition } from "../lib/core/job-registry";
import { ragEmbedPayloadSchema } from "@self-learning/worker-api";
import { contentProcessor, vectorStore } from "@self-learning/rag-processing";

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
		const {
			lessonId,
			lessonTitle,
			pdfBuffers,
			articleTexts,
			transcriptTexts,
			htmlPages,
			h5pSources
		} = payload;

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

			// Step 5: Process HTML pages (uploaded single-file iframe content) into chunks
			let htmlChunks = 0;
			if (htmlPages.length > 0) {
				console.log("[RagService] Processing HTML pages", { count: htmlPages.length });
				const chunks = await contentProcessor.processHtmlContent(
					htmlPages,
					lessonId,
					lessonTitle
				);
				htmlChunks = chunks.length;

				// Add to vector store
				if (chunks.length > 0) {
					await vectorStore.addDocuments(lessonId, chunks);
				}
			}

			// Step 6: Process H5P sources (h5p.json + content/content.json) into chunks
			let h5pChunks = 0;
			if (h5pSources.length > 0) {
				console.log("[RagService] Processing H5P sources", { count: h5pSources.length });
				const chunks = await contentProcessor.processH5pContent(
					h5pSources,
					lessonId,
					lessonTitle
				);
				h5pChunks = chunks.length;

				// Add to vector store
				if (chunks.length > 0) {
					await vectorStore.addDocuments(lessonId, chunks);
				}
			}

			// Step 7: Prepare result
			const totalChunks = pdfChunks + articleChunks + videoChunks + htmlChunks + h5pChunks;

			if (totalChunks === 0) {
				throw new Error("No content chunks were created. Please check lesson content.");
			}

			const result: {
				success: boolean;
				chunksCreated: number;
				breakdown: {
					pdfChunks: number;
					articleChunks: number;
					videoChunks: number;
					htmlChunks: number;
					h5pChunks: number;
				};
				message: string;
			} = {
				success: true,
				chunksCreated: totalChunks,
				breakdown: {
					pdfChunks,
					articleChunks,
					videoChunks,
					htmlChunks,
					h5pChunks
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
			console.error("[RagService] RAG embed job failed", {
				lessonId,
				lessonTitle,
				error: error instanceof Error ? error.message : String(error)
			});
			throw error;
		}
	}
};
