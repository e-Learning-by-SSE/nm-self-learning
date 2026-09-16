import { contentProcessor } from "./content-processor";
import { vectorStore } from "./vector-store";
import type { PayloadFor, ReturnTypeOf } from "@self-learning/worker-api";

export type RagEmbedPayload = PayloadFor<"ragEmbed">;
export type RagEmbedResult = ReturnTypeOf<"ragEmbed">;

export async function processRagEmbedLesson(payload: RagEmbedPayload): Promise<RagEmbedResult> {
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

			if (chunks.length > 0) {
				await vectorStore.addDocuments(lessonId, chunks);
			}
		}

		// Step 5: Process HTML pages into chunks
		let htmlChunks = 0;
		if (htmlPages.length > 0) {
			console.log("[RagService] Processing HTML pages", { count: htmlPages.length });
			const chunks = await contentProcessor.processHtmlContent(
				htmlPages,
				lessonId,
				lessonTitle
			);
			htmlChunks = chunks.length;

			if (chunks.length > 0) {
				await vectorStore.addDocuments(lessonId, chunks);
			}
		}

		// Step 6: Process H5P sources into chunks
		let h5pChunks = 0;
		if (h5pSources.length > 0) {
			console.log("[RagService] Processing H5P sources", { count: h5pSources.length });
			const chunks = await contentProcessor.processH5pContent(
				h5pSources,
				lessonId,
				lessonTitle
			);
			h5pChunks = chunks.length;

			if (chunks.length > 0) {
				await vectorStore.addDocuments(lessonId, chunks);
			}
		}

		const totalChunks = pdfChunks + articleChunks + videoChunks + htmlChunks + h5pChunks;

		if (totalChunks === 0) {
			throw new Error("No content chunks were created. Please check lesson content.");
		}

		const result: RagEmbedResult = {
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
