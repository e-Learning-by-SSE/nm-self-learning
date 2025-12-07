import { vectorStore } from "./vector-store";
import { contentProcessor } from "./content-processor";
import type { DocumentChunk, RetrievalResult } from "./types";

class RAGProcessor {
	async processContent(
		lessonId: string,
		lessonName: string,
		pdfFiles: string[],
		articleContent: string[],
		videoTranscripts: string[]
	) {
		console.log(`🚀 Starting content processing for lesson: ${lessonName}`);
		if (!lessonId || !lessonName) {
			throw new Error("Lesson ID and Lesson Name are required.");
		}
		try {
			let pdfBuffers: Array<{ buffer: Uint8Array }> = [];
			if (pdfFiles.length > 0) {
				pdfFiles.forEach(url => {
					if (!url.startsWith("http://") && !url.startsWith("https://")) {
						throw new Error(`Invalid PDF URL: ${url}`);
					}
				});
				pdfBuffers = await this.processPDFFromURL(pdfFiles);
			}

			return await this.ingestLesson(
				lessonId,
				lessonName,
				pdfBuffers,
				articleContent,
				videoTranscripts
			);
		} catch (error) {
			console.error(`❌ Failed to process content for lesson ${lessonName}:`, error);
			throw error;
		}
	}

	private async processPDFFromURL(pdfFiles: string[]): Promise<Array<{ buffer: Uint8Array }>> {
		console.log(`📥 Downloading ${pdfFiles.length} PDFs...`);

		const downloadedFiles = await Promise.all(
			pdfFiles.map(async (fileUrl, index) => {
				try {
					console.log(`📄 Downloading PDF ${index + 1}/${pdfFiles.length}: ${fileUrl}`);

					const response = await fetch(fileUrl, {
						headers: {
							"User-Agent": "Mozilla/5.0" // Some servers require user agent
						}
					});

					if (!response.ok) {
						throw new Error(`HTTP ${response.status}: ${response.statusText}`);
					}

					const arrayBuffer = await response.arrayBuffer();
					const uint8Array = new Uint8Array(arrayBuffer);

					console.log(
						`✅ Downloaded PDF ${index + 1}: ${(uint8Array.length / 1024 / 1024).toFixed(2)} MB`
					);

					return { buffer: uint8Array };
				} catch (error) {
					console.error(`❌ Failed to download PDF from ${fileUrl}:`, error);
					throw new Error(
						`Failed to download PDF from ${fileUrl}: ${error instanceof Error ? error.message : String(error)}`
					);
				}
			})
		);

		return downloadedFiles;
	}

	private async ingestLesson(
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
				console.log(`⚠️ Lesson ${lessonId} already exists. Deleting old data...`);
				await vectorStore.deleteLesson(lessonId);
			}
			let pdfChunks: DocumentChunk[] = [];
			let articleChunks: DocumentChunk[] = [];
			let videoChunks: DocumentChunk[] = [];

			if (pdfFiles.length > 0) {
				console.log(`📄 Processing ${pdfFiles.length} PDFs...`);
				pdfChunks = await contentProcessor.processMultiplePDFs(
					pdfFiles,
					lessonId,
					lessonName
				);
				console.log(`✅ Created ${pdfChunks.length} chunks from PDFs`);
			}
			if (articleContent.length > 0) {
				console.log(`📝 Processing ${articleContent.length} articles...`);
				articleChunks = await contentProcessor.processArticles(
					articleContent,
					lessonId,
					lessonName
				);
				console.log(`✅ Created ${articleChunks.length} chunks from articles`);
			}
			if (videoTranscripts.length > 0) {
				console.log(`🎥 Processing ${videoTranscripts.length} video transcripts...`);
				videoChunks = await contentProcessor.processVideoTranscripts(
					videoTranscripts,
					lessonId,
					lessonName
				);
				console.log(`✅ Created ${videoChunks.length} chunks from videos`);
			}

			const allChunks = [...pdfChunks, ...articleChunks, ...videoChunks];

			if (allChunks.length === 0) {
				throw new Error("No content chunks were created. Please check lesson content.");
			}
			console.log(`📊 Total chunks created: ${allChunks.length}`);
			await vectorStore.addDocuments(lessonId, allChunks);
			console.log(`✅ Lesson ${lessonName} ingested successfully!`);
			return {
				success: true,
				chunksCreated: allChunks.length,
				breakdown: {
					pdfChunks: pdfChunks.length,
					articleChunks: articleChunks.length,
					videoChunks: videoChunks.length
				},
				message: `Successfully ingested lesson with ${allChunks.length} chunks`
			};
		} catch (error) {
			console.error("❌ Ingestion failed:", error);
			throw error;
		}
	}

	/**
	 * Retrieve relevant context for a question
	 */
	async retrieveContext(
		lessonId: string,
		question: string,
		topK = 5
	): Promise<{ context: string; sources: RetrievalResult[] }> {
		try {
			const exists = await vectorStore.lessonExists(lessonId);
			if (!exists) {
				console.warn(`⚠️ Lesson ${lessonId} does not exist in vector store.`);
				return {
					context: "No relevant content found for lesson data.",
					sources: []
				};
			}

			const results = await vectorStore.search(lessonId, question, topK);

			if (results.length === 0) {
				return {
					context: "No relevant content found for this question.",
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

	/**
	 * Delete lesson from vector store
	 */
	async deleteLesson(lessonId: string) {
		const exist = await vectorStore.lessonExists(lessonId);
		if (exist) {
			await vectorStore.deleteLesson(lessonId);
			console.log(`✅ Lesson ${lessonId} deleted from vector store.`);
		} else {
			console.log(`⚠️ Lesson ${lessonId} does not exist in vector store.`);
		}
	}
}
export const ragProcessor = new RAGProcessor();
