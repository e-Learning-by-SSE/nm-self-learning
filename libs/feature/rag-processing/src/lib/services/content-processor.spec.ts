// Mock pdf-parse before importing the processor (it is required lazily but
// mocking ensures stable behavior in tests).
jest.mock("pdf-parse", () => {
	const getText = jest.fn().mockResolvedValue({ text: "  Hello world  ", numpages: 2 });

	function PDFParse(_buffer: Uint8Array) {
		return { getText };
	}

	return { PDFParse };
});

// Mock chunking util to return deterministic chunks based on input string
jest.mock("../utils/chunking", () => ({
	chunkText: jest.fn((text: string) => {
		// split into two roughly-equal parts for predictable output
		const mid = Math.ceil(text.length / 2);
		return [text.slice(0, mid), text.slice(mid)];
	})
}));

import { contentProcessor } from "./content-processor";

describe("ContentProcessor", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("extractTextFromPDF returns trimmed text and uses pdf-parse", async () => {
		const buffer = new Uint8Array([1, 2, 3]);
		const text = await contentProcessor.extractTextFromPDF(buffer);
		expect(text).toBe("Hello world");
	});

	it("processPDF creates PDF chunks with proper metadata", async () => {
		const buffer = new Uint8Array([4, 5, 6]);
		const chunks = await contentProcessor.processPDF(buffer, "lesson-1", "MyLesson");
		expect(Array.isArray(chunks)).toBe(true);
		expect(chunks.length).toBe(2);
		expect(chunks[0].id).toContain("lesson-1");
		expect(chunks[0].metadata.sourceType).toBe("pdf");
		expect(chunks[0].text.length).toBeGreaterThan(0);
	});

	it("processMultiplePDFs processes all files", async () => {
		const files = [
			{ data: Buffer.from("dummy").toString("base64"), url: "a.pdf" },
			{ data: Buffer.from("other").toString("base64"), url: "b.pdf" }
		];
		const chunks = await contentProcessor.processMultiplePDFs(files, "lesson-2", "MultiLesson");
		expect(chunks.length).toBe(4); // 2 files * 2 chunks (chunkText mocked)
	});

	it("processArticles skips empty articles and returns article chunks", async () => {
		const articles = ["First article content", "", "Second article content"];
		const chunks = await contentProcessor.processArticles(
			articles,
			"lesson-3",
			"ArticlesLesson"
		);
		// empty article skipped -> 2 articles * 2 chunks each = 4
		expect(chunks.length).toBe(4);
		expect(chunks.every(c => c.metadata.sourceType === "article")).toBe(true);
	});

	it("processVideoTranscripts skips empty transcripts and returns video chunks", async () => {
		const transcripts = ["One transcript", "   ", "Another transcript"];
		const chunks = await contentProcessor.processVideoTranscripts(
			transcripts,
			"lesson-4",
			"VideoLesson"
		);
		// one empty/whitespace transcript skipped -> 2 transcripts * 2 chunks = 4
		expect(chunks.length).toBe(4);
		expect(chunks.every(c => c.metadata.sourceType === "video")).toBe(true);
	});
});
