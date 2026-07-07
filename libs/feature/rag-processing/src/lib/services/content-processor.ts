import { PDFChunk, ArticleChunk, VideoChunk, HTMLChunk, ChunkOptions } from "../types/chunk";
import { chunkText } from "../utils/chunking";
import { extractText } from "unpdf";
import { parse } from "node-html-parser";

// Suppress "Warning: TT: undefined function: 32" warning, which is not controlled by the library, but by lower level api.
const originalWarn = console.warn;
console.warn = (...args: unknown[]) => {
	if (typeof args[0] === "string" && args[0].includes("TT: undefined function")) {
		return;
	}
	originalWarn(...args);
};

/**
 * Service for processing various content types into text chunks.
 *
 * Responsibilities:
 * - PDF text extraction (used during RagEmbedJob only)
 * - Article text chunking
 * - Video transcript chunking
 * - HTML text extraction and chunking (for uploaded single-file and zip/entry-point iframe content)
 *
 * Note: This service is only used in the worker-service RagEmbedJob pipeline to convert PDF binary data to strings.
 * After extraction, all content types are strings and pass through EmbeddingService → VectorStore.
 */
export class ContentProcessor {
	/**
	 * Extract text content from PDF buffer
	 */
	async extractTextFromPDF(buffer: Uint8Array): Promise<string> {
		// PDF files always start with the magic bytes "%PDF" (0x25 0x50 0x44 0x46)
		// If these bytes are missing, the buffer is not a real PDF (e.g. an HTML error page)
		const isPDF =
			buffer[0] === 0x25 && // %
			buffer[1] === 0x50 && // P
			buffer[2] === 0x44 && // D
			buffer[3] === 0x46; // F

		if (!isPDF) {
			throw new Error("Invalid PDF: buffer is not a PDF file (missing %PDF header)");
		}

		try {
			const { text } = await extractText(buffer, { mergePages: true });
			return text.trim();
		} catch (error) {
			console.error("[ContentProcessor] PDF text extraction failed", {
				error: error instanceof Error ? error.message : String(error)
			});
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
		const allChunks: PDFChunk[] = [];
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			try {
				const buffer = Buffer.from(file.data, "base64");
				const uint8Array = new Uint8Array(buffer);
				const chunks = await this.processPDF(uint8Array, lessonId, lessonName, options);
				allChunks.push(...chunks);
			} catch (error) {
				console.warn(
					"[ContentProcessor] Skipping invalid PDF — article/video content for this lesson will still be processed",
					{
						url: file.url,
						lessonId,
						error: error instanceof Error ? error.message : String(error)
					}
				);
			}
		}
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
		const allChunks: ArticleChunk[] = [];
		for (let articleIndex = 0; articleIndex < articles.length; articleIndex++) {
			const article = articles[articleIndex];
			if (!article || article.trim().length === 0) {
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
		const allChunks: VideoChunk[] = [];
		for (let videoIndex = 0; videoIndex < transcripts.length; videoIndex++) {
			const transcript = transcripts[videoIndex];

			if (!transcript || transcript.trim().length === 0) {
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

		return allChunks;
	}

	/**
	 * Extract plain text from an HTML page, dropping script/style content
	 * and collapsing whitespace left behind by markup.
	 */
	private extractTextFromHtml(html: string): string {
		const root = parse(html);
		root.querySelectorAll("script, style").forEach(el => el.remove());
		return root.textContent.replace(/\s+/g, " ").trim();
	}

	/**
	 * Process uploaded HTML pages (single-file `html` iframes, or the entry-point
	 * page of an unpacked `zip` iframe) into chunks.
	 *
	 * Note: only the entry-point page is processed for zip archives — linked
	 * sub-pages within the same archive are not crawled.
	 */
	async processHtmlContent(
		pages: Array<{ data: string; url: string }>,
		lessonId: string,
		lessonName: string,
		options?: Partial<ChunkOptions>
	): Promise<HTMLChunk[]> {
		const allChunks: HTMLChunk[] = [];
		for (let htmlIndex = 0; htmlIndex < pages.length; htmlIndex++) {
			const page = pages[htmlIndex];
			let text: string;
			try {
				const html = Buffer.from(page.data, "base64").toString("utf-8");
				text = this.extractTextFromHtml(html);
			} catch (error) {
				console.warn(
					"[ContentProcessor] Skipping invalid HTML page — other content types will still be processed",
					{
						url: page.url,
						lessonId,
						error: error instanceof Error ? error.message : String(error)
					}
				);
				continue;
			}

			if (!text) {
				continue;
			}

			const textChunks = chunkText(text, options);
			const chunks: HTMLChunk[] = textChunks.map((chunkedText, chunkIndex) => ({
				id: `${lessonId}_${lessonName}_html${htmlIndex}_chunk_${chunkIndex}`,
				text: chunkedText,
				metadata: {
					lessonId,
					lessonName,
					htmlIndex,
					chunkIndex,
					sourceType: "html" as const
				}
			}));
			allChunks.push(...chunks);
		}
		return allChunks;
	}
}

export const contentProcessor = new ContentProcessor();
