// Mock downloadMultiple/downloadHtmlMultiple/downloadJsonMultiple to avoid real HTTP calls in unit tests.
// content-preparation.ts imports them from "./download", so we mock that same path.
jest.mock("./download", () => ({
	downloadMultiple: jest.fn(),
	downloadHtmlMultiple: jest.fn(),
	downloadJsonMultiple: jest.fn()
}));

jest.setTimeout(10000);

import { prepareRagContent } from "./content-preparation";
import { downloadMultiple, downloadHtmlMultiple, downloadJsonMultiple } from "./download";
import { LessonContent } from "@self-learning/types";

const mockDownloadMultiple = downloadMultiple as jest.MockedFunction<typeof downloadMultiple>;
const mockDownloadHtmlMultiple = downloadHtmlMultiple as jest.MockedFunction<
	typeof downloadHtmlMultiple
>;
const mockDownloadJsonMultiple = downloadJsonMultiple as jest.MockedFunction<
	typeof downloadJsonMultiple
>;

// ---------------------------------------------------------------------------
// prepareRagContent tests
// ---------------------------------------------------------------------------

describe("prepareRagContent", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		// Default: no PDFs/HTML pages/H5P files downloaded unless a test overrides this
		mockDownloadMultiple.mockResolvedValue([]);
		mockDownloadHtmlMultiple.mockResolvedValue([]);
		mockDownloadJsonMultiple.mockResolvedValue([]);
	});

	// =========================================================================
	describe("article content", () => {
		// =========================================================================

		it("extracts text from a single article", async () => {
			// Setup
			const content: LessonContent = [
				{
					type: "article",
					meta: { estimatedDuration: 5 },
					value: { content: "TypeScript is a typed superset of JavaScript." }
				}
			];

			// Exercise
			const result = await prepareRagContent(content);

			// Verify
			expect(result.articleTexts).toEqual(["TypeScript is a typed superset of JavaScript."]);
			expect(result.pdfBuffers).toEqual([]);
			expect(result.transcriptTexts).toEqual([]);
		});

		it("extracts text from multiple articles", async () => {
			// Setup
			const content: LessonContent = [
				{
					type: "article",
					meta: { estimatedDuration: 5 },
					value: { content: "First article." }
				},
				{
					type: "article",
					meta: { estimatedDuration: 3 },
					value: { content: "Second article." }
				}
			];

			// Exercise
			const result = await prepareRagContent(content);

			// Verify
			expect(result.articleTexts).toEqual(["First article.", "Second article."]);
		});

		it("preserves empty article text as-is (filtering is the worker's concern)", async () => {
			// Setup
			const content: LessonContent = [
				{ type: "article", meta: { estimatedDuration: 0 }, value: { content: "" } }
			];

			// Exercise
			const result = await prepareRagContent(content);

			// Verify
			expect(result.articleTexts).toEqual([""]);
		});
	});

	// =========================================================================
	describe("PDF content", () => {
		// =========================================================================

		it("passes PDF URLs to downloadMultiple and returns the buffers", async () => {
			// Setup
			const fakePdfBuffer = {
				data: "base64encodedpdf==",
				url: "https://example.com/slides.pdf"
			};
			mockDownloadMultiple.mockClear();
			mockDownloadMultiple.mockResolvedValue([fakePdfBuffer]);
			const content: LessonContent = [
				{
					type: "pdf",
					meta: { estimatedDuration: 10 },
					value: { url: "https://example.com/slides.pdf" }
				}
			];

			// Exercise
			const result = await prepareRagContent(content);

			// Verify – downloadMultiple receives the URL array and the optional lessonContext
			// (undefined when prepareRagContent is called without one).
			expect(mockDownloadMultiple).toHaveBeenCalledWith(
				["https://example.com/slides.pdf"],
				undefined
			);
			expect(result.pdfBuffers).toEqual([fakePdfBuffer]);
			expect(result.articleTexts).toEqual([]);
			expect(result.transcriptTexts).toEqual([]);
		});

		it("does not call downloadMultiple when there are no PDF items", async () => {
			// Setup
			const content: LessonContent = [
				{
					type: "article",
					meta: { estimatedDuration: 5 },
					value: { content: "Some text." }
				}
			];

			// Exercise
			await prepareRagContent(content);

			// Verify
			expect(mockDownloadMultiple).not.toHaveBeenCalled();
		});

		it("passes multiple PDF URLs together in a single downloadMultiple call", async () => {
			// Setup
			mockDownloadMultiple.mockResolvedValue([
				{ data: "pdf1base64==", url: "https://example.com/a.pdf" },
				{ data: "pdf2base64==", url: "https://example.com/b.pdf" }
			]);
			const content: LessonContent = [
				{
					type: "pdf",
					meta: { estimatedDuration: 5 },
					value: { url: "https://example.com/a.pdf" }
				},
				{
					type: "pdf",
					meta: { estimatedDuration: 5 },
					value: { url: "https://example.com/b.pdf" }
				}
			];

			// Exercise
			const result = await prepareRagContent(content);

			// Verify
			expect(mockDownloadMultiple).toHaveBeenCalledTimes(1);
			expect(mockDownloadMultiple).toHaveBeenCalledWith(
				["https://example.com/a.pdf", "https://example.com/b.pdf"],
				undefined
			);
			expect(result.pdfBuffers).toHaveLength(2);
		});

		it("forwards lessonContext to downloadMultiple when provided", async () => {
			// Setup
			mockDownloadMultiple.mockResolvedValue([]);
			const content: LessonContent = [
				{
					type: "pdf",
					meta: { estimatedDuration: 5 },
					value: { url: "https://example.com/doc.pdf" }
				}
			];
			const lessonContext = { lessonId: "lesson-42", lessonTitle: "Advanced TypeScript" };

			// Exercise
			await prepareRagContent(content, lessonContext);

			// Verify – lessonContext must be forwarded so download errors carry the right metadata.
			expect(mockDownloadMultiple).toHaveBeenCalledWith(
				["https://example.com/doc.pdf"],
				lessonContext
			);
		});
	});

	// =========================================================================
	describe("video content — no subtitle", () => {
		// =========================================================================

		it("returns empty transcriptTexts when video has no subtitle", async () => {
			// Setup
			const content: LessonContent = [
				{
					type: "video",
					meta: { duration: 120 },
					value: { url: "https://example.com/video.mp4" }
				}
			];

			// Exercise
			const result = await prepareRagContent(content);

			// Verify
			expect(result.transcriptTexts).toEqual([]);
		});

		it("returns empty transcriptTexts when video subtitle exists but src is empty", async () => {
			// Setup
			const content: LessonContent = [
				{
					type: "video",
					meta: { duration: 120 },
					value: {
						url: "https://example.com/video.mp4",
						subtitle: { src: "", label: "Deutsch", srcLang: "de" }
					}
				}
			];

			// Exercise
			const result = await prepareRagContent(content);

			// Verify
			expect(result.transcriptTexts).toEqual([]);
		});
	});

	// =========================================================================
	describe("video content — with subtitle (WebVTT stripping)", () => {
		// =========================================================================

		it("strips WEBVTT header and timestamp lines, returning only spoken text", async () => {
			// Setup
			const vttContent = [
				"WEBVTT",
				"",
				"00:00:00.000 --> 00:00:04.500",
				" Hello and welcome to this lesson.",
				"",
				"00:00:04.500 --> 00:00:09.200",
				" Today we will cover the basics of TypeScript.",
				""
			].join("\n");
			const content: LessonContent = [
				{
					type: "video",
					meta: { duration: 10 },
					value: {
						url: "https://example.com/video.mp4",
						subtitle: { src: vttContent, label: "Deutsch", srcLang: "de" }
					}
				}
			];

			// Exercise
			const result = await prepareRagContent(content);

			// Verify
			expect(result.transcriptTexts).toHaveLength(1);
			expect(result.transcriptTexts[0]).not.toContain("WEBVTT");
			expect(result.transcriptTexts[0]).not.toContain("-->");
			expect(result.transcriptTexts[0]).toContain("Hello and welcome to this lesson.");
			expect(result.transcriptTexts[0]).toContain(
				"Today we will cover the basics of TypeScript."
			);
		});

		it("produces one transcript entry per video with a subtitle", async () => {
			// Setup
			const makeVtt = (text: string) => `WEBVTT\n\n00:00:00.000 --> 00:00:05.000\n ${text}\n`;
			const content: LessonContent = [
				{
					type: "video",
					meta: { duration: 5 },
					value: {
						url: "https://example.com/video1.mp4",
						subtitle: {
							src: makeVtt("First video text."),
							label: "Deutsch",
							srcLang: "de"
						}
					}
				},
				{
					type: "video",
					meta: { duration: 5 },
					value: {
						url: "https://example.com/video2.mp4",
						subtitle: {
							src: makeVtt("Second video text."),
							label: "Deutsch",
							srcLang: "de"
						}
					}
				}
			];

			// Exercise
			const result = await prepareRagContent(content);

			// Verify
			expect(result.transcriptTexts).toHaveLength(2);
			expect(result.transcriptTexts[0]).toContain("First video text.");
			expect(result.transcriptTexts[1]).toContain("Second video text.");
		});

		it("skips videos without subtitle and includes videos with subtitle in the same lesson", async () => {
			// Setup
			const vttContent =
				"WEBVTT\n\n00:00:00.000 --> 00:00:03.000\n Only this video has a subtitle.\n";
			const content: LessonContent = [
				{
					type: "video",
					meta: { duration: 5 },
					value: { url: "https://example.com/no-subtitle.mp4" }
				},
				{
					type: "video",
					meta: { duration: 5 },
					value: {
						url: "https://example.com/with-subtitle.mp4",
						subtitle: { src: vttContent, label: "Deutsch", srcLang: "de" }
					}
				}
			];

			// Exercise
			const result = await prepareRagContent(content);

			// Verify
			expect(result.transcriptTexts).toHaveLength(1);
			expect(result.transcriptTexts[0]).toContain("Only this video has a subtitle.");
		});
	});

	// =========================================================================
	describe("mixed content", () => {
		// =========================================================================

		it("processes all content types together correctly, ignoring url-sourced iframes", async () => {
			// Setup
			const fakePdfBuffer = { data: "pdfdata==", url: "https://example.com/doc.pdf" };
			mockDownloadMultiple.mockResolvedValue([fakePdfBuffer]);
			const vttContent = "WEBVTT\n\n00:00:00.000 --> 00:00:05.000\n Video transcript text.\n";
			const content: LessonContent = [
				{
					type: "article",
					meta: { estimatedDuration: 5 },
					value: { content: "Article text." }
				},
				{
					type: "pdf",
					meta: { estimatedDuration: 10 },
					value: { url: "https://example.com/doc.pdf" }
				},
				{
					type: "video",
					meta: { duration: 5 },
					value: {
						url: "https://example.com/video.mp4",
						subtitle: { src: vttContent, label: "Deutsch", srcLang: "de" }
					}
				},
				{
					type: "iframe",
					meta: { estimatedDuration: 5 },
					value: { url: "https://example.com/embed" }
				}
			];

			// Exercise
			const result = await prepareRagContent(content);

			// Verify
			expect(result.articleTexts).toEqual(["Article text."]);
			expect(result.pdfBuffers).toEqual([fakePdfBuffer]);
			expect(result.transcriptTexts).toHaveLength(1);
			expect(result.transcriptTexts[0]).toContain("Video transcript text.");
			// iframe with source "url" (external embed) is intentionally ignored
			expect(result.htmlPages).toEqual([]);
			expect(mockDownloadHtmlMultiple).not.toHaveBeenCalled();
		});

		it("returns all empty arrays for a lesson with only a url-sourced iframe", async () => {
			// Setup
			const content: LessonContent = [
				{
					type: "iframe",
					meta: { estimatedDuration: 5 },
					value: { url: "https://example.com/embed" }
				}
			];

			// Exercise
			const result = await prepareRagContent(content);

			// Verify
			expect(result.pdfBuffers).toEqual([]);
			expect(result.articleTexts).toEqual([]);
			expect(result.transcriptTexts).toEqual([]);
			expect(result.htmlPages).toEqual([]);
			expect(mockDownloadMultiple).not.toHaveBeenCalled();
			expect(mockDownloadHtmlMultiple).not.toHaveBeenCalled();
		});

		it("returns all empty arrays for empty content", async () => {
			// Setup
			const content: LessonContent = [];

			// Exercise
			const result = await prepareRagContent(content);

			// Verify
			expect(result.pdfBuffers).toEqual([]);
			expect(result.articleTexts).toEqual([]);
			expect(result.transcriptTexts).toEqual([]);
			expect(result.htmlPages).toEqual([]);
			expect(mockDownloadMultiple).not.toHaveBeenCalled();
			expect(mockDownloadHtmlMultiple).not.toHaveBeenCalled();
		});
	});

	// =========================================================================
	describe("iframe content", () => {
		// =========================================================================

		it("ignores iframe items with source 'url' or unset", async () => {
			// Setup
			const content: LessonContent = [
				{
					type: "iframe",
					meta: { estimatedDuration: 5 },
					value: { url: "https://example.com/embed-a", source: "url" }
				},
				{
					type: "iframe",
					meta: { estimatedDuration: 5 },
					value: { url: "https://example.com/embed-b" } // source unset
				}
			];

			// Exercise
			const result = await prepareRagContent(content);

			// Verify
			expect(result.htmlPages).toEqual([]);
			expect(mockDownloadHtmlMultiple).not.toHaveBeenCalled();
		});

		it("ignores iframe items with source 'zip' (dropped — relies on undocumented archive conventions)", async () => {
			// Setup
			const content: LessonContent = [
				{
					type: "iframe",
					meta: { estimatedDuration: 5 },
					value: {
						url: "https://storage.example.com/content/xyz/index.html",
						source: "zip",
						entryPoint: "index.html",
						originalFileName: "nano-demo.zip",
						folderObjectName: "content/xyz"
					}
				}
			];

			// Exercise
			const result = await prepareRagContent(content);

			// Verify
			expect(result.htmlPages).toEqual([]);
			expect(mockDownloadHtmlMultiple).not.toHaveBeenCalled();
		});

		it("downloads iframe items with source 'html' and returns the pages", async () => {
			// Setup
			const fakeHtmlPage = {
				data: Buffer.from("<html><body>Hi</body></html>").toString("base64"),
				url: "https://storage.example.com/uploads/abc-nano-demo.html"
			};
			mockDownloadHtmlMultiple.mockResolvedValue([fakeHtmlPage]);
			const content: LessonContent = [
				{
					type: "iframe",
					meta: { estimatedDuration: 5 },
					value: {
						url: "https://storage.example.com/uploads/abc-nano-demo.html",
						source: "html",
						originalFileName: "nano-demo.html"
					}
				}
			];

			// Exercise
			const result = await prepareRagContent(content);

			// Verify
			expect(mockDownloadHtmlMultiple).toHaveBeenCalledWith(
				["https://storage.example.com/uploads/abc-nano-demo.html"],
				undefined
			);
			expect(result.htmlPages).toEqual([fakeHtmlPage]);
		});

		it("collects multiple html iframe URLs into a single downloadHtmlMultiple call", async () => {
			// Setup
			mockDownloadHtmlMultiple.mockResolvedValue([
				{ data: "aGVsbG8=", url: "https://example.com/a.html" },
				{ data: "d29ybGQ=", url: "https://example.com/b.html" }
			]);
			const content: LessonContent = [
				{
					type: "iframe",
					meta: { estimatedDuration: 5 },
					value: { url: "https://example.com/a.html", source: "html" }
				},
				{
					type: "iframe",
					meta: { estimatedDuration: 5 },
					value: { url: "https://example.com/b.html", source: "html" }
				}
			];

			// Exercise
			const result = await prepareRagContent(content);

			// Verify
			expect(mockDownloadHtmlMultiple).toHaveBeenCalledTimes(1);
			expect(mockDownloadHtmlMultiple).toHaveBeenCalledWith(
				["https://example.com/a.html", "https://example.com/b.html"],
				undefined
			);
			expect(result.htmlPages).toHaveLength(2);
		});

		it("forwards lessonContext to downloadHtmlMultiple when provided", async () => {
			// Setup
			mockDownloadHtmlMultiple.mockResolvedValue([]);
			const content: LessonContent = [
				{
					type: "iframe",
					meta: { estimatedDuration: 5 },
					value: { url: "https://example.com/a.html", source: "html" }
				}
			];
			const lessonContext = { lessonId: "lesson-99", lessonTitle: "Interactive Demo" };

			// Exercise
			await prepareRagContent(content, lessonContext);

			// Verify
			expect(mockDownloadHtmlMultiple).toHaveBeenCalledWith(
				["https://example.com/a.html"],
				lessonContext
			);
		});
	});

	// =========================================================================
	describe("H5P content detection", () => {
		// =========================================================================

		it("fetches h5p.json and content/content.json relative to the folder URL", async () => {
			// Setup — H5P sources store value.url as the unpacked folder base (see storage_router)
			const fakeH5pJson = {
				data: Buffer.from(JSON.stringify({ title: "Pizza Quiz" })).toString("base64"),
				url: "https://storage.example.com/content/xyz/h5p.json"
			};
			const fakeContentJson = {
				data: Buffer.from(JSON.stringify({ text: "Question text" })).toString("base64"),
				url: "https://storage.example.com/content/xyz/content/content.json"
			};
			mockDownloadJsonMultiple.mockImplementation(async (urls: string[]) => {
				if (urls[0].endsWith("h5p.json")) return [fakeH5pJson];
				if (urls[0].endsWith("content.json")) return [fakeContentJson];
				return [];
			});
			const content: LessonContent = [
				{
					type: "iframe",
					meta: { estimatedDuration: 5 },
					value: {
						url: "https://storage.example.com/content/xyz",
						source: "h5p",
						folderObjectName: "content/xyz"
					}
				}
			];

			// Exercise
			const result = await prepareRagContent(content);

			// Verify
			expect(mockDownloadJsonMultiple).toHaveBeenCalledWith(
				["https://storage.example.com/content/xyz/h5p.json"],
				undefined
			);
			expect(mockDownloadJsonMultiple).toHaveBeenCalledWith(
				["https://storage.example.com/content/xyz/content/content.json"],
				undefined
			);
			expect(result.h5pSources).toEqual([
				{ h5pJson: fakeH5pJson, contentJson: fakeContentJson }
			]);
		});

		it("still includes the source when only one of h5p.json/content.json was retrievable", async () => {
			// Setup — content.json download failed, h5p.json succeeded
			const fakeH5pJson = {
				data: Buffer.from(JSON.stringify({ title: "Partial Package" })).toString("base64"),
				url: "https://storage.example.com/content/abc/h5p.json"
			};
			mockDownloadJsonMultiple.mockImplementation(async (urls: string[]) => {
				if (urls[0].endsWith("h5p.json")) return [fakeH5pJson];
				return []; // content.json failed
			});
			const content: LessonContent = [
				{
					type: "iframe",
					meta: { estimatedDuration: 5 },
					value: { url: "https://storage.example.com/content/abc", source: "h5p" }
				}
			];

			// Exercise
			const result = await prepareRagContent(content);

			// Verify
			expect(result.h5pSources).toEqual([{ h5pJson: fakeH5pJson, contentJson: null }]);
		});

		it("omits a package entirely when neither h5p.json nor content.json could be retrieved", async () => {
			// Setup — both downloads failed
			mockDownloadJsonMultiple.mockResolvedValue([]);
			const content: LessonContent = [
				{
					type: "iframe",
					meta: { estimatedDuration: 5 },
					value: { url: "https://storage.example.com/content/broken", source: "h5p" }
				}
			];

			// Exercise
			const result = await prepareRagContent(content);

			// Verify
			expect(result.h5pSources).toEqual([]);
		});

		it("does not call downloadJsonMultiple when there are no h5p iframe items", async () => {
			// Setup
			const content: LessonContent = [
				{
					type: "iframe",
					meta: { estimatedDuration: 5 },
					value: { url: "https://example.com/a.html", source: "html" }
				}
			];

			// Exercise
			const result = await prepareRagContent(content);

			// Verify
			expect(mockDownloadJsonMultiple).not.toHaveBeenCalled();
			expect(result.h5pSources).toEqual([]);
		});

		it("resolves h5p.json/content.json URLs independently for multiple h5p packages", async () => {
			// Setup
			mockDownloadJsonMultiple.mockImplementation(async (urls: string[]) => {
				return urls.map(url => ({ data: "e30=", url })); // "{}"
			});
			const content: LessonContent = [
				{
					type: "iframe",
					meta: { estimatedDuration: 5 },
					value: { url: "https://example.com/content/a", source: "h5p" }
				},
				{
					type: "iframe",
					meta: { estimatedDuration: 5 },
					value: { url: "https://example.com/content/b", source: "h5p" }
				}
			];

			// Exercise
			const result = await prepareRagContent(content);

			// Verify
			expect(mockDownloadJsonMultiple).toHaveBeenCalledWith(
				[
					"https://example.com/content/a/h5p.json",
					"https://example.com/content/b/h5p.json"
				],
				undefined
			);
			expect(mockDownloadJsonMultiple).toHaveBeenCalledWith(
				[
					"https://example.com/content/a/content/content.json",
					"https://example.com/content/b/content/content.json"
				],
				undefined
			);
			expect(result.h5pSources).toHaveLength(2);
		});

		it("forwards lessonContext to downloadJsonMultiple when provided", async () => {
			// Setup
			mockDownloadJsonMultiple.mockResolvedValue([]);
			const content: LessonContent = [
				{
					type: "iframe",
					meta: { estimatedDuration: 5 },
					value: { url: "https://example.com/content/xyz", source: "h5p" }
				}
			];
			const lessonContext = { lessonId: "lesson-h5p-1", lessonTitle: "H5P Lesson" };

			// Exercise
			await prepareRagContent(content, lessonContext);

			// Verify
			expect(mockDownloadJsonMultiple).toHaveBeenCalledWith(
				["https://example.com/content/xyz/h5p.json"],
				lessonContext
			);
			expect(mockDownloadJsonMultiple).toHaveBeenCalledWith(
				["https://example.com/content/xyz/content/content.json"],
				lessonContext
			);
		});
	});
});
