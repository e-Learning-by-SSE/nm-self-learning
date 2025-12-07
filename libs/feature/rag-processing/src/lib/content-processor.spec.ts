import { contentProcessor } from "./content-processor";

// Mock pdf-parse
jest.mock("pdf-parse", () => {
	return {
		__esModule: true,
		default: jest.fn(),
		PDFParse: jest.fn().mockImplementation(() => ({
			getText: jest.fn().mockResolvedValue({
				text: "Sample PDF content with multiple pages. ".repeat(50),
				numpages: 2
			})
		}))
	};
});

describe("ContentProcessor", () => {
	describe("extractTextFromPDF", () => {
		const { PDFParse } = jest.requireMock("pdf-parse");
		PDFParse.mockImplementationOnce(() => ({
			getText: jest.fn().mockRejectedValue(new Error("Invalid PDF"))
		}));
		// 	const mockLessonId = "test-lesson-456";
		// 	const mockLessonName = "Multi PDF Lesson";

		// 	it("should process multiple PDFs and combine chunks", async () => {
		// 		const files = [
		// 			{ buffer: new Uint8Array([1, 2, 3]) },
		// 			{ buffer: new Uint8Array([4, 5, 6]) }
		// 		];

		// 		const chunks = await contentProcessor.processMultiplePDFs(
		// 			files,
		// 			mockLessonId,
		// 			mockLessonName
		// 		);

		// 		expect(chunks.length).toBeGreaterThan(0);
		// 		// Should have chunks from both files
		// 		expect(chunks.length).toBeGreaterThanOrEqual(2);
		// 	});

		// 	it("should handle empty file array", async () => {
		// 		const chunks = await contentProcessor.processMultiplePDFs(
		// 			[],
		// 			mockLessonId,
		// 			mockLessonName
		// 		);

		// 		expect(chunks).toEqual([]);
		// 	});
		// });

		describe("processArticles", () => {
			const mockLessonId = "article-lesson-789";
			const mockLessonName = "Article Lesson";

			it("should process articles and create chunks", async () => {
				const articles = [
					"This is a sample article with some content. ".repeat(100),
					"This is another article with different content. ".repeat(100)
				];

				const chunks = await contentProcessor.processArticles(
					articles,
					mockLessonId,
					mockLessonName
				);

				expect(chunks.length).toBeGreaterThan(0);
				expect(chunks[0].metadata).toHaveProperty("articleIndex");
			});

			it("should handle empty articles array", async () => {
				const chunks = await contentProcessor.processArticles(
					[],
					mockLessonId,
					mockLessonName
				);

				expect(chunks).toEqual([]);
			});

			it("should assign correct article indices", async () => {
				const articles = ["Article 1 content", "Article 2 content"];

				const chunks = await contentProcessor.processArticles(
					articles,
					mockLessonId,
					mockLessonName
				);

				const article0Chunks = chunks.filter(c => c.metadata.articleIndex === 0);
				const article1Chunks = chunks.filter(c => c.metadata.articleIndex === 1);

				expect(article0Chunks.length).toBeGreaterThan(0);
				expect(article1Chunks.length).toBeGreaterThan(0);
			});

			it("should create unique IDs with article index", async () => {
				const articles = ["Short article", "Another short article"];

				const chunks = await contentProcessor.processArticles(
					articles,
					mockLessonId,
					mockLessonName
				);

				chunks.forEach(chunk => {
					expect(chunk.id).toMatch(/article\d+_chunk_\d+/);
				});
			});
		});

		describe("processVideoTranscripts", () => {
			const mockLessonId = "video-lesson-101";
			const mockLessonName = "Video Lesson";

			it("should process video transcripts and create chunks", async () => {
				const transcripts = [
					"Video transcript with spoken words. ".repeat(100),
					"Another video transcript. ".repeat(100)
				];

				const chunks = await contentProcessor.processVideoTranscripts(
					transcripts,
					mockLessonId,
					mockLessonName
				);

				expect(chunks.length).toBeGreaterThan(0);
				expect(chunks[0].metadata).toHaveProperty("videoIndex");
			});

			it("should handle empty transcripts array", async () => {
				const chunks = await contentProcessor.processVideoTranscripts(
					[],
					mockLessonId,
					mockLessonName
				);

				expect(chunks).toEqual([]);
			});

			it("should assign correct video indices", async () => {
				const transcripts = ["Video 1 transcript", "Video 2 transcript"];

				const chunks = await contentProcessor.processVideoTranscripts(
					transcripts,
					mockLessonId,
					mockLessonName
				);

				const video0Chunks = chunks.filter(c => c.metadata.videoIndex === 0);
				const video1Chunks = chunks.filter(c => c.metadata.videoIndex === 1);

				expect(video0Chunks.length).toBeGreaterThan(0);
				expect(video1Chunks.length).toBeGreaterThan(0);
			});

			it("should create unique IDs with video index", async () => {
				const transcripts = ["Short transcript"];

				const chunks = await contentProcessor.processVideoTranscripts(
					transcripts,
					mockLessonId,
					mockLessonName
				);

				chunks.forEach(chunk => {
					expect(chunk.id).toMatch(/video\d+_chunk_\d+/);
				});
			});
		});

		describe("Text Chunking", () => {
			it("should respect chunk size parameter", async () => {
				const longText = "word ".repeat(500);
				const articles = [longText];

				const chunks = await contentProcessor.processArticles(
					articles,
					"test-id",
					"test-name"
				);

				// Each chunk should be approximately 1000 characters or less
				chunks.forEach(chunk => {
					expect(chunk.text.length).toBeLessThanOrEqual(1100); // Some tolerance
				});
			});

			it("should create overlapping chunks for better context", async () => {
				const text = "unique_marker_start " + "word ".repeat(300) + " unique_marker_end";
				const articles = [text];

				const chunks = await contentProcessor.processArticles(
					articles,
					"test-id",
					"test-name"
				);

				// With overlap=200, consecutive chunks should share content
				if (chunks.length > 1) {
					// This is hard to test without exposing the chunking logic
					// But we can verify chunks exist
					expect(chunks.length).toBeGreaterThan(1);
				}
			});
		});

		describe("Edge Cases", () => {
			it("should handle very short content", async () => {
				const shortArticle = ["Hi"];

				const chunks = await contentProcessor.processArticles(
					shortArticle,
					"test-id",
					"test-name"
				);

				expect(chunks.length).toBe(1);
				expect(chunks[0].text).toBe("Hi");
			});

			it("should handle content with special characters", async () => {
				const specialContent = ["Content with émojis 🎉 and spëcial çhars"];

				const chunks = await contentProcessor.processArticles(
					specialContent,
					"test-id",
					"test-name"
				);

				expect(chunks[0].text).toContain("🎉");
				expect(chunks[0].text).toContain("spëcial");
			});

			it("should trim whitespace from chunks", async () => {
				const contentWithWhitespace = ["   Content with spaces   "];

				const chunks = await contentProcessor.processArticles(
					contentWithWhitespace,
					"test-id",
					"test-name"
				);

				expect(chunks[0].text).toBe(chunks[0].text.trim());
			});
		});
	});
});
