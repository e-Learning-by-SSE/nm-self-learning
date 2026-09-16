// Mock used PDF extractor.
jest.mock("unpdf", () => ({
	extractText: jest.fn().mockResolvedValue({ text: "  Hello world  ", totalPages: 2 })
}));

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

	// =========================================================================
	describe("processHtmlContent", () => {
		// =========================================================================

		it("extracts text and strips script/style tags before chunking", async () => {
			// Setup
			const html =
				"<html><head><style>body{color:red}</style></head>" +
				"<body><script>alert('x')</script><p>Hello world</p></body></html>";
			const pages = [{ data: Buffer.from(html).toString("base64"), url: "a.html" }];

			// Exercise
			const chunks = await contentProcessor.processHtmlContent(
				pages,
				"lesson-html",
				"HtmlLesson"
			);

			// Verify
			const joined = chunks.map(c => c.text).join("");
			expect(joined).toContain("Hello world");
			expect(joined).not.toContain("alert");
			expect(joined).not.toContain("color:red");
			expect(chunks.every(c => c.metadata.sourceType === "html")).toBe(true);
		});

		it("sets the correct htmlIndex and sequential chunkIndex in metadata", async () => {
			// Setup
			const pageA = "<html><body>Page A content</body></html>";
			const pageB = "<html><body>Page B content</body></html>";
			const pages = [
				{ data: Buffer.from(pageA).toString("base64"), url: "a.html" },
				{ data: Buffer.from(pageB).toString("base64"), url: "b.html" }
			];

			// Exercise
			const chunks = await contentProcessor.processHtmlContent(
				pages,
				"lesson-hidx",
				"HIdxLesson"
			);

			// Verify – chunkText mock produces 2 chunks per page
			expect(chunks.map(c => c.metadata.htmlIndex)).toEqual([0, 0, 1, 1]);
			expect(chunks.map(c => c.metadata.chunkIndex)).toEqual([0, 1, 0, 1]);
			expect(chunks.every(c => c.id.includes("lesson-hidx"))).toBe(true);
		});

		it("skips pages that produce no text after tag stripping (e.g. script/style-only)", async () => {
			// Setup
			const html =
				"<html><head><style>.a{}</style></head><body><script>1</script></body></html>";
			const pages = [{ data: Buffer.from(html).toString("base64"), url: "empty.html" }];

			// Exercise
			const chunks = await contentProcessor.processHtmlContent(
				pages,
				"lesson-empty-html",
				"EmptyHtmlLesson"
			);

			// Verify
			expect(chunks).toHaveLength(0);
		});

		it("skips whitespace-only pages", async () => {
			// Setup
			const html = "<html><body>   \n\t  </body></html>";
			const pages = [{ data: Buffer.from(html).toString("base64"), url: "whitespace.html" }];

			// Exercise
			const chunks = await contentProcessor.processHtmlContent(
				pages,
				"lesson-ws",
				"WsLesson"
			);

			// Verify
			expect(chunks).toHaveLength(0);
		});

		it("skips an individual malformed page without throwing, and still processes the rest", async () => {
			// Setup — invalid base64 for the first page, valid HTML for the second
			const validHtml = "<html><body>Valid content here</body></html>";
			const pages = [
				{ data: "not-valid-base64!!!", url: "broken.html" },
				{ data: Buffer.from(validHtml).toString("base64"), url: "ok.html" }
			];

			// Exercise
			const chunks = await contentProcessor.processHtmlContent(
				pages,
				"lesson-mixed",
				"MixedLesson"
			);

			// Verify — the broken page is skipped, the valid one is still processed
			expect(chunks.length).toBeGreaterThan(0);
			expect(chunks.every(c => c.metadata.sourceType === "html")).toBe(true);
		});

		it("returns an empty array when no pages are provided", async () => {
			// Setup – empty list

			// Exercise
			const chunks = await contentProcessor.processHtmlContent(
				[],
				"lesson-no-html",
				"NoHtmlLesson"
			);

			// Verify
			expect(chunks).toHaveLength(0);
		});
	});

	// =========================================================================
	describe("processH5pContent", () => {
		// =========================================================================

		const toB64 = (obj: unknown) => Buffer.from(JSON.stringify(obj)).toString("base64");

		it("extracts the title from h5p.json and merges it with content.json text", async () => {
			// Setup
			const h5pJson = toB64({ title: "Pizza Toppings Quiz", mainLibrary: "H5P.QuestionSet" });
			const contentJson = toB64({
				question: "Was ist der beste Pizza-Belag?",
				library: "H5P.MultiChoice 1.16"
			});
			const sources = [
				{
					h5pJson: { data: h5pJson, url: "https://example.com/h5p.json" },
					contentJson: {
						data: contentJson,
						url: "https://example.com/content/content.json"
					}
				}
			];

			// Exercise
			const chunks = await contentProcessor.processH5pContent(
				sources,
				"lesson-h5p",
				"H5pLesson"
			);

			// Verify — strip all whitespace before comparing: the chunkText mock splits at an
			// exact character midpoint, which can land inside a word rather than at a space.
			const joined = chunks
				.map(c => c.text)
				.join("")
				.replace(/\s+/g, "");
			expect(joined).toContain("PizzaToppingsQuiz");
			expect(joined).toContain("WasistderbestePizza-Belag?");
			// "library" is a blocked key — its value must never be indexed
			expect(joined).not.toContain("H5P.MultiChoice");
			expect(chunks.every(c => c.metadata.sourceType === "h5p")).toBe(true);
		});

		it("filters out library references, file paths, hex colors, and numeric/boolean tokens", async () => {
			// Setup
			const contentJson = toB64({
				params: {
					text: "Real authored question text.",
					library: "H5P.AdvancedText 1.1",
					backgroundColor: "#44546A",
					image: { path: "images/file-abc123.png" },
					someFlag: "true",
					someCount: "42"
				}
			});
			const sources = [
				{
					h5pJson: null,
					contentJson: { data: contentJson, url: "https://example.com/content.json" }
				}
			];

			// Exercise
			const chunks = await contentProcessor.processH5pContent(
				sources,
				"lesson-filter",
				"FilterLesson"
			);

			// Verify
			const joined = chunks
				.map(c => c.text)
				.join(" ")
				.replace(/\s+/g, " ");
			expect(joined).toContain("Real authored question text.");
			expect(joined).not.toContain("H5P.AdvancedText");
			expect(joined).not.toContain("#44546A");
			expect(joined).not.toContain("file-abc123.png");
			expect(joined).not.toContain("true");
			expect(joined).not.toMatch(/\b42\b/);
		});

		it("strips HTML fragments embedded in content.json text values", async () => {
			// Setup — H5P text fields are frequently HTML-formatted
			const contentJson = toB64({
				text: '<p style="text-align:center;">Hello <strong>world</strong></p>'
			});
			const sources = [
				{
					h5pJson: null,
					contentJson: { data: contentJson, url: "https://example.com/content.json" }
				}
			];

			// Exercise
			const chunks = await contentProcessor.processH5pContent(
				sources,
				"lesson-html-frag",
				"HtmlFragLesson"
			);

			// Verify
			const joined = chunks.map(c => c.text).join(" ");
			expect(joined).toContain("Hello");
			expect(joined).toContain("world");
			expect(joined).not.toContain("<p");
			expect(joined).not.toContain("<strong>");
		});

		it("dedupes identical text values repeated across the content tree", async () => {
			// Setup
			const contentJson = toB64({
				a: { feedback: "Richtig!" },
				b: { feedback: "Richtig!" },
				c: { question: "Unique question text." }
			});
			const sources = [
				{
					h5pJson: null,
					contentJson: { data: contentJson, url: "https://example.com/content.json" }
				}
			];

			// Exercise
			const chunks = await contentProcessor.processH5pContent(
				sources,
				"lesson-dedupe",
				"DedupeLesson"
			);

			// Verify
			const joined = chunks
				.map(c => c.text)
				.join(" ")
				.replace(/\s+/g, " ");
			expect(joined.match(/Richtig!/g)?.length).toBe(1);
			expect(joined).toContain("Unique question text.");
		});

		it("processes h5pJson and contentJson independently when only one is available", async () => {
			// Setup — h5p.json failed to download (null), only content.json present
			const contentJson = toB64({ text: "Content-only narration." });
			const sources = [
				{
					h5pJson: null,
					contentJson: { data: contentJson, url: "https://example.com/content.json" }
				}
			];

			// Exercise
			const chunks = await contentProcessor.processH5pContent(
				sources,
				"lesson-partial",
				"PartialLesson"
			);

			// Verify
			const joined = chunks
				.map(c => c.text)
				.join(" ")
				.replace(/\s+/g, " ");
			expect(joined).toContain("Content-only narration.");
		});

		it("sets the correct h5pIndex and sequential chunkIndex in metadata", async () => {
			// Setup
			const sources = [
				{
					h5pJson: null,
					contentJson: {
						data: toB64({ text: "Package A content." }),
						url: "https://example.com/a/content.json"
					}
				},
				{
					h5pJson: null,
					contentJson: {
						data: toB64({ text: "Package B content." }),
						url: "https://example.com/b/content.json"
					}
				}
			];

			// Exercise
			const chunks = await contentProcessor.processH5pContent(
				sources,
				"lesson-h5pidx",
				"H5pIdxLesson"
			);

			// Verify — chunkText mock produces 2 chunks per package
			expect(chunks.map(c => c.metadata.h5pIndex)).toEqual([0, 0, 1, 1]);
			expect(chunks.map(c => c.metadata.chunkIndex)).toEqual([0, 1, 0, 1]);
			expect(chunks.every(c => c.id.includes("lesson-h5pidx"))).toBe(true);
		});

		it("skips a source whose content.json fails to parse without throwing, and still processes the rest", async () => {
			// Setup
			const sources = [
				{
					h5pJson: null,
					contentJson: {
						data: "not-valid-json-base64!!!",
						url: "https://example.com/broken.json"
					}
				},
				{
					h5pJson: null,
					contentJson: {
						data: toB64({ text: "Still works." }),
						url: "https://example.com/ok.json"
					}
				}
			];

			// Exercise
			const chunks = await contentProcessor.processH5pContent(
				sources,
				"lesson-h5p-mixed",
				"H5pMixedLesson"
			);

			// Verify
			const joined = chunks
				.map(c => c.text)
				.join(" ")
				.replace(/\s+/g, " ");
			expect(joined).toContain("Still works.");
			expect(chunks.every(c => c.metadata.sourceType === "h5p")).toBe(true);
		});

		it("skips a package entirely when both h5pJson and contentJson yield no usable text", async () => {
			// Setup — e.g. a title-less h5p.json and a content.json with only blocked-key values
			const sources = [
				{
					h5pJson: {
						data: toB64({ mainLibrary: "H5P.CoursePresentation" }),
						url: "https://example.com/h5p.json"
					},
					contentJson: {
						data: toB64({ library: "H5P.Text 1.1" }),
						url: "https://example.com/content.json"
					}
				}
			];

			// Exercise
			const chunks = await contentProcessor.processH5pContent(
				sources,
				"lesson-empty-h5p",
				"EmptyH5pLesson"
			);

			// Verify
			expect(chunks).toHaveLength(0);
		});

		it("returns an empty array when no sources are provided", async () => {
			// Setup – empty list

			// Exercise
			const chunks = await contentProcessor.processH5pContent(
				[],
				"lesson-no-h5p",
				"NoH5pLesson"
			);

			// Verify
			expect(chunks).toHaveLength(0);
		});
	});
});
