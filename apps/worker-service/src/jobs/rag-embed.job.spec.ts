// Unit-test the job's run() logic directly rather than through WorkerHost/threads —
// contentProcessor/vectorStore talk to real parsers and ChromaDB, which mocked here.
const mockLessonExists = jest.fn();
const mockDeleteLesson = jest.fn();
const mockAddDocuments = jest.fn();
const mockProcessMultiplePDFs = jest.fn();
const mockProcessArticles = jest.fn();
const mockProcessVideoTranscripts = jest.fn();
const mockProcessHtmlContent = jest.fn();
const mockProcessH5pContent = jest.fn();

jest.mock("@self-learning/rag-processing", () => ({
	__esModule: true,
	contentProcessor: {
		processMultiplePDFs: (...args: unknown[]) => mockProcessMultiplePDFs(...args),
		processArticles: (...args: unknown[]) => mockProcessArticles(...args),
		processVideoTranscripts: (...args: unknown[]) => mockProcessVideoTranscripts(...args),
		processHtmlContent: (...args: unknown[]) => mockProcessHtmlContent(...args),
		processH5pContent: (...args: unknown[]) => mockProcessH5pContent(...args)
	},
	vectorStore: {
		lessonExists: (...args: unknown[]) => mockLessonExists(...args),
		deleteLesson: (...args: unknown[]) => mockDeleteLesson(...args),
		addDocuments: (...args: unknown[]) => mockAddDocuments(...args)
	}
}));

jest.mock("@self-learning/worker-api", () => ({
	__esModule: true,
	ragEmbedPayloadSchema: { parse: (x: unknown) => x }
}));

import { ragEmbedJob } from "./rag-embed.job";
import type { JobContext } from "../lib/core/job-registry";

const testContext: JobContext = { requestedBy: "rag-embed-job-spec" };

type H5pSource = {
	h5pJson: { data: string; url: string } | null;
	contentJson: { data: string; url: string } | null;
};

type Payload = {
	lessonId: string;
	lessonTitle: string;
	pdfBuffers: Array<{ data: string; url: string }>;
	articleTexts: string[];
	transcriptTexts: string[];
	htmlPages: Array<{ data: string; url: string }>;
	h5pSources: H5pSource[];
};

const createPayload = (overrides: Partial<Payload> = {}): Payload => ({
	lessonId: "lesson-1",
	lessonTitle: "Interactive Demo",
	pdfBuffers: [],
	articleTexts: [],
	transcriptTexts: [],
	htmlPages: [],
	h5pSources: [],
	...overrides
});

describe("ragEmbedJob", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockLessonExists.mockResolvedValue(false);
		mockDeleteLesson.mockResolvedValue(undefined);
		mockAddDocuments.mockResolvedValue(undefined);
		mockProcessMultiplePDFs.mockResolvedValue([]);
		mockProcessArticles.mockResolvedValue([]);
		mockProcessVideoTranscripts.mockResolvedValue([]);
		mockProcessHtmlContent.mockResolvedValue([]);
		mockProcessH5pContent.mockResolvedValue([]);
	});

	describe("HTML content processing", () => {
		it("processes htmlPages and folds htmlChunks into the breakdown and total", async () => {
			// Setup
			const htmlPages = [{ data: "aGVsbG8=", url: "https://example.com/demo.html" }];
			const fakeHtmlChunks = [
				{ id: "c1", text: "chunk 1", metadata: { sourceType: "html" } },
				{ id: "c2", text: "chunk 2", metadata: { sourceType: "html" } }
			];
			mockProcessHtmlContent.mockResolvedValue(fakeHtmlChunks);
			const payload = createPayload({ htmlPages });

			// Exercise
			const result = await ragEmbedJob.run(payload, testContext);

			// Verify
			expect(mockProcessHtmlContent).toHaveBeenCalledWith(
				htmlPages,
				"lesson-1",
				"Interactive Demo"
			);
			expect(mockAddDocuments).toHaveBeenCalledWith("lesson-1", fakeHtmlChunks);
			expect(result.breakdown.htmlChunks).toBe(2);
			expect(result.chunksCreated).toBe(2);
			expect(result.success).toBe(true);
		});

		it("does not call processHtmlContent or addDocuments when htmlPages is empty", async () => {
			// Setup — at least one other content type so the job doesn't throw for "no chunks"
			mockProcessArticles.mockResolvedValue([
				{ id: "a1", text: "article chunk", metadata: { sourceType: "article" } }
			]);
			const payload = createPayload({ articleTexts: ["Some article."] });

			// Exercise
			await ragEmbedJob.run(payload, testContext);

			// Verify
			expect(mockProcessHtmlContent).not.toHaveBeenCalled();
			expect(mockAddDocuments).not.toHaveBeenCalledWith(
				"lesson-1",
				expect.arrayContaining([
					expect.objectContaining({ metadata: { sourceType: "html" } })
				])
			);
		});

		it("does not add documents to the vector store when processHtmlContent returns no chunks", async () => {
			// Setup
			mockProcessHtmlContent.mockResolvedValue([]);
			mockProcessArticles.mockResolvedValue([
				{ id: "a1", text: "article chunk", metadata: { sourceType: "article" } }
			]);
			const payload = createPayload({
				htmlPages: [{ data: "ZW1wdHk=", url: "https://example.com/empty.html" }],
				articleTexts: ["Some article."]
			});

			// Exercise
			const result = await ragEmbedJob.run(payload, testContext);

			// Verify
			expect(result.breakdown.htmlChunks).toBe(0);
			// addDocuments should only be called once, for the article chunks
			expect(mockAddDocuments).toHaveBeenCalledTimes(1);
		});
	});

	describe("H5P content processing", () => {
		it("processes h5pSources and folds h5pChunks into the breakdown and total", async () => {
			// Setup
			const h5pSources: H5pSource[] = [
				{
					h5pJson: {
						data: "eyJ0aXRsZSI6IlF1aXoifQ==",
						url: "https://example.com/content/xyz/h5p.json"
					},
					contentJson: {
						data: "eyJ0ZXh0IjoiV2FzIGlzdCBkZXIgYmVzdGUgUGl6emEtQmVsYWc/In0=",
						url: "https://example.com/content/xyz/content/content.json"
					}
				}
			];
			const fakeH5pChunks = [
				{
					id: "h5p1",
					text: "Was ist der beste Pizza-Belag?",
					metadata: { sourceType: "h5p" }
				}
			];
			mockProcessH5pContent.mockResolvedValue(fakeH5pChunks);
			const payload = createPayload({ h5pSources });

			// Exercise
			const result = await ragEmbedJob.run(payload, testContext);

			// Verify
			expect(mockProcessH5pContent).toHaveBeenCalledWith(
				h5pSources,
				"lesson-1",
				"Interactive Demo"
			);
			expect(mockAddDocuments).toHaveBeenCalledWith("lesson-1", fakeH5pChunks);
			expect(result.breakdown.h5pChunks).toBe(1);
			expect(result.chunksCreated).toBe(1);
			expect(result.success).toBe(true);
		});

		it("does not call processH5pContent or addDocuments when h5pSources is empty", async () => {
			// Setup — at least one other content type so the job doesn't throw for "no chunks"
			mockProcessArticles.mockResolvedValue([
				{ id: "a1", text: "article chunk", metadata: { sourceType: "article" } }
			]);
			const payload = createPayload({ articleTexts: ["Some article."] });

			// Exercise
			await ragEmbedJob.run(payload, testContext);

			// Verify
			expect(mockProcessH5pContent).not.toHaveBeenCalled();
		});

		it("does not add documents to the vector store when processH5pContent returns no chunks", async () => {
			// Setup — e.g. a package whose content.json only had blocked-key values
			mockProcessH5pContent.mockResolvedValue([]);
			mockProcessArticles.mockResolvedValue([
				{ id: "a1", text: "article chunk", metadata: { sourceType: "article" } }
			]);
			const payload = createPayload({
				h5pSources: [
					{
						h5pJson: null,
						contentJson: {
							data: "e30=",
							url: "https://example.com/content/xyz/content.json"
						}
					}
				],
				articleTexts: ["Some article."]
			});

			// Exercise
			const result = await ragEmbedJob.run(payload, testContext);

			// Verify
			expect(result.breakdown.h5pChunks).toBe(0);
			// addDocuments should only be called once, for the article chunks
			expect(mockAddDocuments).toHaveBeenCalledTimes(1);
		});
	});

	describe("combined breakdown across content types", () => {
		it("sums pdf, article, video, html, and h5p chunk counts into chunksCreated", async () => {
			// Setup
			mockProcessMultiplePDFs.mockResolvedValue([
				{ id: "p1", text: "pdf chunk", metadata: { sourceType: "pdf" } }
			]);
			mockProcessArticles.mockResolvedValue([
				{ id: "a1", text: "article chunk", metadata: { sourceType: "article" } }
			]);
			mockProcessVideoTranscripts.mockResolvedValue([
				{ id: "v1", text: "video chunk", metadata: { sourceType: "video" } },
				{ id: "v2", text: "video chunk 2", metadata: { sourceType: "video" } }
			]);
			mockProcessHtmlContent.mockResolvedValue([
				{ id: "h1", text: "html chunk", metadata: { sourceType: "html" } }
			]);
			mockProcessH5pContent.mockResolvedValue([
				{ id: "h5p1", text: "h5p chunk", metadata: { sourceType: "h5p" } }
			]);
			const payload = createPayload({
				pdfBuffers: [{ data: "cGRm", url: "https://example.com/a.pdf" }],
				articleTexts: ["Article."],
				transcriptTexts: ["Transcript."],
				htmlPages: [{ data: "aHRtbA==", url: "https://example.com/a.html" }],
				h5pSources: [
					{
						h5pJson: null,
						contentJson: {
							data: "e30=",
							url: "https://example.com/content/xyz/content.json"
						}
					}
				]
			});

			// Exercise
			const result = await ragEmbedJob.run(payload, testContext);

			// Verify
			expect(result.breakdown).toEqual({
				pdfChunks: 1,
				articleChunks: 1,
				videoChunks: 2,
				htmlChunks: 1,
				h5pChunks: 1
			});
			expect(result.chunksCreated).toBe(6);
		});

		it("throws when no chunks were created across any content type, including html and h5p", async () => {
			// Setup — all processors return empty, payload otherwise valid
			const payload = createPayload();

			// Exercise / Verify
			await expect(ragEmbedJob.run(payload, testContext)).rejects.toThrow(
				"No content chunks were created. Please check lesson content."
			);
		});
	});

	describe("existing lesson cleanup", () => {
		it("deletes existing embeddings before re-processing when the lesson already exists", async () => {
			// Setup
			mockLessonExists.mockResolvedValue(true);
			mockProcessHtmlContent.mockResolvedValue([
				{ id: "h1", text: "html chunk", metadata: { sourceType: "html" } }
			]);
			const payload = createPayload({
				htmlPages: [{ data: "aHRtbA==", url: "https://example.com/a.html" }]
			});

			// Exercise
			await ragEmbedJob.run(payload, testContext);

			// Verify
			expect(mockDeleteLesson).toHaveBeenCalledWith("lesson-1");
		});
	});
});
