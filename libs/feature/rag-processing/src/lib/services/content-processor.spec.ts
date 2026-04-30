// Mock pdf-parse before importing the processor (it is required lazily but
// mocking ensures stable behavior in tests).
jest.mock("pdf-parse", () => {
	const getText = jest.fn().mockResolvedValue({ text: "  Hello world  ", numpages: 2 });

	function PDFParse(_buffer: Uint8Array) {
		return { getText };
	}

	return { PDFParse };
});

// Mock chunking util to return deterministic chunks based on input string.
// Splits text into two roughly-equal halves for predictable, stable output.
jest.mock("../utils/chunking", () => ({
	chunkText: jest.fn((text: string) => {
		const mid = Math.ceil(text.length / 2);
		return [text.slice(0, mid), text.slice(mid)];
	})
}));

import { contentProcessor } from "./content-processor";
import type { PDFChunk, ArticleChunk, VideoChunk } from "../types/chunk";

// ---------------------------------------------------------------------------
// ContentProcessor tests
// ---------------------------------------------------------------------------

describe("ContentProcessor", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	// =========================================================================
	describe("extractTextFromPDF", () => {
		// =========================================================================

		it("returns trimmed text from the parsed PDF buffer", async () => {
			// Setup
			const buffer = new TextEncoder().encode("%PDF-1.4\n%dummy pdf content");

			// Exercise
			const text = await contentProcessor.extractTextFromPDF(buffer);

			// Verify
			expect(text).toBe("Hello world");
		});
	});

	// =========================================================================
	describe("processPDF", () => {
		// =========================================================================

		it("creates the expected number of PDF chunks with correct metadata", async () => {
			// Setup
			const buffer = new TextEncoder().encode("%PDF-1.4\n%dummy pdf content");
			const lessonId = "lesson-1";
			const lessonName = "MyLesson";

			// Exercise
			const chunks: PDFChunk[] = await contentProcessor.processPDF(
				buffer,
				lessonId,
				lessonName
			);

			// Verify
			expect(Array.isArray(chunks)).toBe(true);
			expect(chunks).toHaveLength(2);
			expect(chunks[0].id).toContain(lessonId);
			expect(chunks[0].metadata.sourceType).toBe("pdf");
			expect(chunks[0].metadata.lessonId).toBe(lessonId);
			expect(chunks[0].metadata.lessonName).toBe(lessonName);
			expect(chunks[0].text.length).toBeGreaterThan(0);
		});

		it("assigns sequential chunkIndex values across all chunks", async () => {
			// Setup
			const buffer = new TextEncoder().encode(
				"%PDF-1.4\n%dummy pdf content that is a bit longer to ensure we get multiple chunks from the chunkText function"
			);

			// Exercise
			const chunks: PDFChunk[] = await contentProcessor.processPDF(
				buffer,
				"lesson-idx",
				"IndexLesson"
			);

			// Verify
			chunks.forEach((chunk, index) => {
				expect(chunk.metadata.chunkIndex).toBe(index);
			});
		});
	});

	// =========================================================================
	describe("processMultiplePDFs", () => {
		// =========================================================================

		it("processes every file and aggregates all resulting chunks", async () => {
			// Setup
			const buffer1 = new TextEncoder().encode("%PDF-1.4\n%dummy pdf content");
			const buffer2 = new TextEncoder().encode("%PDF-1.4\n%other pdf content");
			const files = [
				{ data: Buffer.from(buffer1).toString("base64"), url: "a.pdf" },
				{ data: Buffer.from(buffer2).toString("base64"), url: "b.pdf" }
			];
			const expectedChunkCount = 4; // 2 files × 2 chunks each (chunkText mock)

			// Exercise
			const chunks: PDFChunk[] = await contentProcessor.processMultiplePDFs(
				files,
				"lesson-2",
				"MultiLesson"
			);

			// Verify
			expect(chunks).toHaveLength(expectedChunkCount);
			expect(chunks.every(c => c.metadata.sourceType === "pdf")).toBe(true);
		});

		it("returns an empty array when no files are provided", async () => {
			// Setup – no files

			// Exercise
			const chunks: PDFChunk[] = await contentProcessor.processMultiplePDFs(
				[],
				"lesson-empty",
				"EmptyLesson"
			);

			// Verify
			expect(chunks).toHaveLength(0);
		});
	});

	// =========================================================================
	describe("processArticles", () => {
		// =========================================================================

		it("skips empty articles and returns article chunks for non-empty content", async () => {
			// Setup
			const articles = ["First article content", "", "Second article content"];
			const expectedChunkCount = 4; // 2 non-empty articles × 2 chunks each

			// Exercise
			const chunks: ArticleChunk[] = await contentProcessor.processArticles(
				articles,
				"lesson-3",
				"ArticlesLesson"
			);

			// Verify
			expect(chunks).toHaveLength(expectedChunkCount);
			expect(chunks.every(c => c.metadata.sourceType === "article")).toBe(true);
		});

		it("sets the correct articleIndex in metadata", async () => {
			// Setup
			const articles = ["Article A", "Article B"];

			// Exercise
			const chunks: ArticleChunk[] = await contentProcessor.processArticles(
				articles,
				"lesson-meta",
				"MetaLesson"
			);

			// Verify – chunkText produces 2 chunks per article
			const articleIndices = chunks.map(c => c.metadata.articleIndex);
			expect(articleIndices).toEqual([0, 0, 1, 1]);
		});

		it("returns an empty array when all articles are empty strings", async () => {
			// Setup
			const articles = ["", "   ", "\t\n"];

			// Exercise
			const chunks: ArticleChunk[] = await contentProcessor.processArticles(
				articles,
				"lesson-blank",
				"BlankLesson"
			);

			// Verify
			expect(chunks).toHaveLength(0);
		});

		it("returns an empty array when the articles list is empty", async () => {
			// Setup – empty list

			// Exercise
			const chunks: ArticleChunk[] = await contentProcessor.processArticles(
				[],
				"lesson-none",
				"NoneLesson"
			);

			// Verify
			expect(chunks).toHaveLength(0);
		});
	});

	// =========================================================================
	describe("processVideoTranscripts", () => {
		// =========================================================================

		it("skips whitespace-only transcripts and returns video chunks for valid ones", async () => {
			// Setup
			const transcripts = ["One transcript", "   ", "Another transcript"];
			const expectedChunkCount = 4; // 2 non-empty × 2 chunks each

			// Exercise
			const chunks: VideoChunk[] = await contentProcessor.processVideoTranscripts(
				transcripts,
				"lesson-4",
				"VideoLesson"
			);

			// Verify
			expect(chunks).toHaveLength(expectedChunkCount);
			expect(chunks.every(c => c.metadata.sourceType === "video")).toBe(true);
		});

		it("sets the correct videoIndex in metadata", async () => {
			// Setup
			const transcripts = ["Transcript X", "Transcript Y"];

			// Exercise
			const chunks: VideoChunk[] = await contentProcessor.processVideoTranscripts(
				transcripts,
				"lesson-vidx",
				"VidxLesson"
			);

			// Verify – chunkText produces 2 chunks per transcript
			const videoIndices = chunks.map(c => c.metadata.videoIndex);
			expect(videoIndices).toEqual([0, 0, 1, 1]);
		});

		it("returns an empty array when all transcripts are blank", async () => {
			// Setup
			const transcripts = ["", "  "];

			// Exercise
			const chunks: VideoChunk[] = await contentProcessor.processVideoTranscripts(
				transcripts,
				"lesson-blank-vid",
				"BlankVid"
			);

			// Verify
			expect(chunks).toHaveLength(0);
		});

		it("returns an empty array when the transcript list is empty", async () => {
			// Setup – empty list

			// Exercise
			const chunks: VideoChunk[] = await contentProcessor.processVideoTranscripts(
				[],
				"lesson-no-vid",
				"NoVid"
			);

			// Verify
			expect(chunks).toHaveLength(0);
		});
	});
});
