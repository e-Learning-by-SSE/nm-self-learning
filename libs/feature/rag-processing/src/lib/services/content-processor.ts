import {
	PDFChunk,
	ArticleChunk,
	VideoChunk,
	HTMLChunk,
	H5PChunk,
	ChunkOptions
} from "../types/chunk";
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
	 * Finds the matching close brace for a `{` at `startIndex`, treating braces inside
	 * quoted strings as literal characters rather than nesting. Used to carve a JSON
	 * object out of a larger JS source without a full JS parser.
	 */
	private extractBalancedJson(text: string, startIndex: number): string | null {
		let depth = 0;
		let inString = false;
		let escaped = false;

		for (let i = startIndex; i < text.length; i++) {
			const ch = text[i];
			if (inString) {
				if (escaped) {
					escaped = false;
				} else if (ch === "\\") {
					escaped = true;
				} else if (ch === '"') {
					inString = false;
				}
				continue;
			}
			if (ch === '"') {
				inString = true;
			} else if (ch === "{") {
				depth++;
			} else if (ch === "}") {
				depth--;
				if (depth === 0) {
					return text.slice(startIndex, i + 1);
				}
			}
		}
		return null;
	}

	/**
	 * A large share of single-file HTML uploads are H5P's own "download as HTML" export:
	 * the page body is an empty container, and all authored text sits in an inline
	 * `H5PIntegration = {...}` variable, under `contents[*].jsonContent` — a JSON string
	 * with the same shape as a packaged H5P's content.json. Returns "" if the page has
	 * no H5PIntegration variable, so callers can fall back to plain body-text extraction.
	 */
	private extractH5PIntegrationText(html: string): string {
		const markerIndex = html.indexOf("H5PIntegration");
		if (markerIndex === -1) return "";

		const braceIndex = html.indexOf("{", markerIndex);
		if (braceIndex === -1) return "";

		const jsonText = this.extractBalancedJson(html, braceIndex);
		if (!jsonText) return "";

		let integration: unknown;
		try {
			integration = JSON.parse(jsonText);
		} catch {
			return "";
		}

		const contents = (integration as { contents?: Record<string, unknown> })?.contents;
		if (!contents || typeof contents !== "object") return "";

		const seen = new Set<string>();
		const collected: string[] = [];

		for (const entry of Object.values(contents)) {
			const jsonContent = (entry as { jsonContent?: unknown })?.jsonContent;
			if (typeof jsonContent !== "string") continue;
			try {
				const params = JSON.parse(jsonContent);
				this.collectH5pText(params, undefined, seen, collected);
			} catch {
				continue; // this content id's params were malformed; other ids still get processed
			}
		}

		return collected.join(". ");
	}

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
				text = this.extractH5PIntegrationText(html) || this.extractTextFromHtml(html);
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

	private stripHtmlFragment(value: string): string {
		const root = parse(value);
		return root.textContent.replace(/\s+/g, " ").trim();
	}

	/**
	 * H5P content.json mixes authored text with structural fields (library refs, ids,
	 * file paths, colors) at the same nesting level, so we filter by key name and by
	 * value shape rather than relying on structure alone.
	 */
	private static readonly H5P_BLOCKED_KEYS = new Set([
		"library",
		"path",
		"mime",
		"mimeType",
		"subContentId",
		"contentType",
		"id",
		"defaultLanguage",
		"embedTypes",
		"machineName",
		"icon",
		"iconType",
		"license"
	]);

	private static readonly H5P_LIBRARY_REF_REGEX = /^H5P\.[\w.]+\s+[\d.]+$/;
	private static readonly H5P_FILE_PATH_REGEX =
		/\.(png|jpe?g|gif|svg|webp|mp4|webm|mp3|wav|ogg|m4a|json)$/i;
	private static readonly H5P_HEX_COLOR_REGEX = /^#[0-9a-fA-F]{3,8}$/;

	private isLikelyH5pContentText(key: string | undefined, value: string): boolean {
		if (!value.trim()) return false;
		if (key && ContentProcessor.H5P_BLOCKED_KEYS.has(key)) return false;
		if (ContentProcessor.H5P_LIBRARY_REF_REGEX.test(value)) return false;
		if (ContentProcessor.H5P_FILE_PATH_REGEX.test(value)) return false;
		if (ContentProcessor.H5P_HEX_COLOR_REGEX.test(value)) return false;
		if (/^-?\d+(\.\d+)?$/.test(value.trim())) return false;
		if (/^(true|false)$/i.test(value.trim())) return false;
		return true;
	}

	/**
	 * H5P defines dozens of content types with different schemas, so rather than
	 * special-casing each one, this walks the whole tree and keeps any string that
	 * passes isLikelyH5pContentText.
	 */
	private collectH5pText(
		node: unknown,
		key: string | undefined,
		seen: Set<string>,
		texts: string[]
	): void {
		if (node === null || node === undefined) return;

		if (Array.isArray(node)) {
			for (const child of node) {
				this.collectH5pText(child, key, seen, texts);
			}
			return;
		}

		if (typeof node === "object") {
			for (const [childKey, childValue] of Object.entries(node as Record<string, unknown>)) {
				this.collectH5pText(childValue, childKey, seen, texts);
			}
			return;
		}

		if (typeof node === "string" && this.isLikelyH5pContentText(key, node)) {
			const text = this.stripHtmlFragment(node);
			if (text && !seen.has(text)) {
				seen.add(text);
				texts.push(text);
			}
		}
	}

	/**
	 * h5pJson and contentJson are fetched independently in content-preparation.ts, so
	 * either can be null if its download failed — both are handled on their own here.
	 */
	async processH5pContent(
		sources: Array<{
			h5pJson?: { data: string; url: string } | null;
			contentJson?: { data: string; url: string } | null;
		}>,
		lessonId: string,
		lessonName: string,
		options?: Partial<ChunkOptions>
	): Promise<H5PChunk[]> {
		const allChunks: H5PChunk[] = [];

		for (let h5pIndex = 0; h5pIndex < sources.length; h5pIndex++) {
			const h5pJson = sources[h5pIndex].h5pJson ?? null;
			const contentJson = sources[h5pIndex].contentJson ?? null;
			const textParts: string[] = [];

			if (h5pJson) {
				try {
					const parsed = JSON.parse(
						Buffer.from(h5pJson.data, "base64").toString("utf-8")
					);
					if (typeof parsed?.title === "string" && parsed.title.trim()) {
						textParts.push(parsed.title.trim());
					}
				} catch (error) {
					console.warn("[ContentProcessor] Skipping invalid h5p.json", {
						url: h5pJson.url,
						lessonId,
						error: error instanceof Error ? error.message : String(error)
					});
				}
			}

			if (contentJson) {
				try {
					const parsed = JSON.parse(
						Buffer.from(contentJson.data, "base64").toString("utf-8")
					);
					const seen = new Set<string>();
					const collected: string[] = [];
					this.collectH5pText(parsed, undefined, seen, collected);
					textParts.push(...collected);
				} catch (error) {
					console.warn("[ContentProcessor] Skipping invalid content.json", {
						url: contentJson.url,
						lessonId,
						error: error instanceof Error ? error.message : String(error)
					});
				}
			}

			const text = textParts.join(". ");
			if (!text) continue;

			const textChunks = chunkText(text, options);
			const chunks: H5PChunk[] = textChunks.map((chunkedText, chunkIndex) => ({
				id: `${lessonId}_${lessonName}_h5p${h5pIndex}_chunk_${chunkIndex}`,
				text: chunkedText,
				metadata: {
					lessonId,
					lessonName,
					h5pIndex,
					chunkIndex,
					sourceType: "h5p" as const
				}
			}));
			allChunks.push(...chunks);
		}

		return allChunks;
	}
}

export const contentProcessor = new ContentProcessor();
