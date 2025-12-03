import { vectorStore } from "@self-learning/vector-store";
import { documentProcessor } from "./documentProcessor";
import type { DocumentChunk, RetrievalResult } from "@self-learning/types";

class RAGRetriever {
	async processcontent(
		lessonId: string,
		lessonName: string,
		pdfFiles: string[],
		articleContent: string[],
		videoTranscripts: string[]
	) {
		if (pdfFiles.length !== 0) {
			const downloadedFiles = await this.processPDFFromURL(pdfFiles);
			return this.ingestlesson(
				lessonId,
				lessonName,
				downloadedFiles,
				articleContent,
				videoTranscripts
			);
		}
		const pdfContent: Array<{ buffer: Uint8Array }> = [];
		return this.ingestlesson(
			lessonId,
			lessonName,
			pdfContent,
			articleContent,
			videoTranscripts
		);
	}

	async processPDFFromURL(pdfFiles: string[]) {
		const downloadedFiles = await Promise.all(
			pdfFiles.map(async file => {
				const response = await fetch(file);

				if (!response.ok) {
					throw new Error(`Failed to download PDF from ${file}`);
				}

				const uint8Array = new Uint8Array(await response.arrayBuffer());
				return {
					buffer: uint8Array
				};
			})
		);

		return downloadedFiles;
	}

	async ingestlesson(
		lessonId: string,
		lessonName: string,
		pdfFiles: Array<{ buffer: Uint8Array }>,
		articleContent: string[] = [],
		videoTranscripts: string[] = []
	) {
		try {
			console.log(`🚀 Starting ingestion for lesson: ${lessonName}`);

			const exists = await vectorStore.lessonExists(lessonId);
			if (exists) {
				console.log(`⚠️ lesson ${lessonId} already exists. Deleting old data...`);
				await vectorStore.deletelesson(lessonId);
			}

			let pdfChunks: DocumentChunk[] = [];
			let articleChunks: DocumentChunk[] = [];
			let videoChunks: DocumentChunk[] = [];

			if (pdfFiles.length !== 0) {
				pdfChunks = await documentProcessor.processMultiplePDFs(
					pdfFiles,
					lessonId,
					lessonName
				);
			}
			if (articleContent.length !== 0) {
				articleChunks = await documentProcessor.processArticles(
					articleContent,
					lessonId,
					lessonName
				);
			}
			if (videoTranscripts.length !== 0) {
				videoChunks = await documentProcessor.processVideoTranscripts(
					videoTranscripts,
					lessonId,
					lessonName
				);
			}

			const chunks = [...pdfChunks, ...articleChunks, ...videoChunks];

			await vectorStore.addDocuments(lessonId, chunks);

			console.log(`✅ lesson ${lessonName} ingested successfully!`);
			return {
				success: true,
				chunksCreated: chunks.length,
				message: `Successfully ingested ${pdfFiles.length} PDFs`
			};
		} catch (error) {
			console.error("❌ Ingestion failed at retrieval:", error);
			throw error;
		}
	}

	async retrieveContext(
		lessonId: string,
		question: string,
		topK = 5
	): Promise<{ context: string; sources: RetrievalResult[] }> {
		try {
			const exists = await vectorStore.lessonExists(lessonId);
			if (!exists) {
				throw new Error(`lesson ${lessonId} not found. Please ingest the lesson first.`);
			}

			const results = await vectorStore.search(lessonId, question, topK);

			if (results.length === 0) {
				return {
					context: "No relevant content found.",
					sources: []
				};
			}

			const context = results
				.map((result, idx) => {
					const source = result.metadata.lessonName;
					const page = result.metadata.pageNumber
						? ` (Page ${result.metadata.pageNumber})`
						: "";
					return `[Source ${idx + 1}: ${source}${page}]\n${result.text}`;
				})
				.join("\n\n---\n\n");

			return { context, sources: results };
		} catch (error) {
			console.error("❌ Retrieval failed:", error);
			throw error;
		}
	}

	async deletelesson(lessonId: string) {
		await vectorStore.deletelesson(lessonId);
	}
}
export const ragRetriever = new RAGRetriever();
