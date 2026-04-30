// Mock downloadMultiple to avoid real HTTP calls in unit tests.
// content-preparation.ts imports it from "./download", so we mock that same path.
jest.mock("./download", () => ({
	downloadMultiple: jest.fn()
}));

jest.setTimeout(10000);

import { prepareRagContent } from "./content-preparation";
import { downloadMultiple } from "./download";
import { LessonContent } from "@self-learning/types";

const mockDownloadMultiple = downloadMultiple as jest.MockedFunction<typeof downloadMultiple>;

// ---------------------------------------------------------------------------
// prepareRagContent tests
// ---------------------------------------------------------------------------

describe("prepareRagContent", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		// Default: no PDFs downloaded unless a test overrides this
		mockDownloadMultiple.mockResolvedValue([]);
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

		it("processes all content types together correctly", async () => {
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
			// iframe is intentionally ignored by prepareRagContent
		});

		it("returns all empty arrays for a lesson with only iframe content", async () => {
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
			expect(mockDownloadMultiple).not.toHaveBeenCalled();
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
			expect(mockDownloadMultiple).not.toHaveBeenCalled();
		});
	});
});
