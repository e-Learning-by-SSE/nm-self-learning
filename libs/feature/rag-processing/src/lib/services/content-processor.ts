import { PDFChunk, ArticleChunk, VideoChunk, ChunkOptions } from "../types/chunk";
import { chunkText } from "../utils/chunking";

/**
 * Service for processing various content types into chunks
 *
 * Handles PDF extraction, article chunking, and video transcript processing.
 */
export class ContentProcessor {
	private PDFParse: any = null;

	/**
	 * Lazy-load PDF parsing library
	 */
	private async loadPDFParse(): Promise<any> {
		if (!this.PDFParse) {
			const module = await import("pdf-parse");
			this.PDFParse = module.PDFParse || module.default || module;
			console.log("[ContentProcessor] PDF parser loaded");
		}
		return this.PDFParse;
	}

	/**
	 * Extract text content from PDF buffer
	 */
	async extractTextFromPDF(buffer: Uint8Array): Promise<string> {
		try {
			const PDFParse = await this.loadPDFParse();
			const parser = new PDFParse(buffer);
			const data = await parser.getText();

			console.log("[ContentProcessor] PDF text extracted", { pages: data.numpages });

			return data.text.trim();
		} catch (error) {
			console.error("[ContentProcessor] PDF text extraction failed", error);
			throw new Error("PDF extraction failed");
		}
	}

	/**
	 * Process a single PDF buffer into chunks
	 */
	async processPDF(
		buffer: Uint8Array,
		lessonId: string,
		lessonName: string,
		options?: Partial<ChunkOptions>
	): Promise<PDFChunk[]> {
		console.log("[ContentProcessor] Processing PDF", { lessonId, lessonName });

		const fullText = await this.extractTextFromPDF(buffer);
		const textChunks = chunkText(fullText, options);

		const chunks: PDFChunk[] = textChunks.map((text, index) => ({
			id: `${lessonId}_${lessonName}_pdf_chunk_${index}`,
			text,
			metadata: {
				lessonId,
				lessonName,
				pageNumber: Math.floor(index / 2) + 1, // Rough estimate
				chunkIndex: index,
				sourceType: "pdf" as const
			}
		}));

		console.log("[ContentProcessor] PDF processed", { chunksCreated: chunks.length });

		return chunks;
	}

	/**
	 * Process multiple PDF buffers into chunks
	 */
	async processMultiplePDFs(
		files: Array<{ data: string; url: string }>,
		lessonId: string,
		lessonName: string,
		options?: Partial<ChunkOptions>
	): Promise<PDFChunk[]> {
		console.log("[ContentProcessor] Processing multiple PDFs", {
			count: files.length,
			lessonId
		});

		const allChunks: PDFChunk[] = [];

		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			console.log("[ContentProcessor] Processing PDF file", {
				index: i + 1,
				total: files.length
			});

			const buffer = Buffer.from(file.data, "base64");
			const uint8Array = new Uint8Array(buffer);

			const chunks = await this.processPDF(uint8Array, lessonId, lessonName, options);
			allChunks.push(...chunks);
		}

		console.log("[ContentProcessor] All PDFs processed", { totalChunks: allChunks.length });

		return allChunks;
	}

	/**
	 * Process articles into chunks
	 */
	async processArticles(
		articles: string[],
		lessonId: string,
		lessonName: string,
		options?: Partial<ChunkOptions>
	): Promise<ArticleChunk[]> {
		console.log("[ContentProcessor] Processing articles", { count: articles.length, lessonId });

		const allChunks: ArticleChunk[] = [];

		for (let articleIndex = 0; articleIndex < articles.length; articleIndex++) {
			const article = articles[articleIndex];

			if (!article || article.trim().length === 0) {
				console.log("[ContentProcessor] Skipping empty article", { articleIndex });
				continue;
			}

			const textChunks = chunkText(article, options);

			const chunks: ArticleChunk[] = textChunks.map((text, chunkIndex) => ({
				id: `${lessonId}_${lessonName}_article${articleIndex}_chunk_${chunkIndex}`,
				text,
				metadata: {
					lessonId,
					lessonName,
					articleIndex,
					chunkIndex,
					sourceType: "article" as const
				}
			}));

			allChunks.push(...chunks);
		}

		console.log("[ContentProcessor] Articles processed", { totalChunks: allChunks.length });

		return allChunks;
	}

	/**
	 * Process video transcripts into chunks
	 */
	async processVideoTranscripts(
		transcripts: string[],
		lessonId: string,
		lessonName: string,
		options?: Partial<ChunkOptions>
	): Promise<VideoChunk[]> {
		console.log("[ContentProcessor] Processing video transcripts", {
			count: transcripts.length,
			lessonId
		});

		const allChunks: VideoChunk[] = [];

		for (let videoIndex = 0; videoIndex < transcripts.length; videoIndex++) {
			const transcript = transcripts[videoIndex];

			if (!transcript || transcript.trim().length === 0) {
				console.log("[ContentProcessor] Skipping empty transcript", { videoIndex });
				continue;
			}

			const textChunks = chunkText(transcript, options);

			const chunks: VideoChunk[] = textChunks.map((text, chunkIndex) => ({
				id: `${lessonId}_${lessonName}_video${videoIndex}_chunk_${chunkIndex}`,
				text,
				metadata: {
					lessonId,
					lessonName,
					videoIndex,
					chunkIndex,
					sourceType: "video" as const
				}
			}));

			allChunks.push(...chunks);
		}

		console.log("[ContentProcessor] Video transcripts processed", {
			totalChunks: allChunks.length
		});

		return allChunks;
	}
}

export const contentProcessor = new ContentProcessor();
