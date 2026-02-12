// Mock heavy transformers pipeline before importing the service
jest.mock("@xenova/transformers", () => ({
	pipeline: jest.fn()
}));

import { pipeline } from "@xenova/transformers";
import { embeddingService } from "./embedding";

describe("EmbeddingService", () => {
	beforeEach(async () => {
		jest.clearAllMocks();
		// Ensure service is reset between tests
		try {
			await (embeddingService as any).cleanup();
		} catch {}
	});

	it("initializes the model via pipeline and marks initialized", async () => {
		const embedderFn = jest
			.fn()
			.mockResolvedValue({ data: Float32Array.from([0.1, 0.2, 0.3]) });
		(pipeline as jest.Mock).mockResolvedValue(embedderFn);

		await embeddingService.initialize();

		expect(embeddingService.isInitialized()).toBe(true);
		expect(pipeline).toHaveBeenCalledWith(
			"feature-extraction",
			expect.any(String),
			expect.objectContaining({ quantized: expect.any(Boolean) })
		);
	});

	it("generateEmbedding returns numeric array and calls embedder", async () => {
		const embedderFn = jest
			.fn()
			.mockImplementation(async (text: string) => ({
				data: Float32Array.from([text.length, text.length + 1])
			}));
		(pipeline as jest.Mock).mockResolvedValue(embedderFn);

		const out = await embeddingService.generateEmbedding("hello");

		expect(Array.isArray(out)).toBe(true);
		expect(out).toEqual([5, 6]);
		expect(embedderFn).toHaveBeenCalledWith(
			"hello",
			expect.objectContaining({ pooling: expect.any(String), normalize: expect.any(Boolean) })
		);
	});

	it("generateEmbedding throws for empty input", async () => {
		const embedderFn = jest.fn().mockResolvedValue({ data: Float32Array.from([1]) });
		(pipeline as jest.Mock).mockResolvedValue(embedderFn);

		await expect(embeddingService.generateEmbedding("   ")).rejects.toThrow(
			"Cannot generate embedding for empty text"
		);
	});

	it("generateBatchEmbeddings processes texts, skips empties and returns arrays", async () => {
		const embedderFn = jest
			.fn()
			.mockImplementation(async (text: string) => ({
				data: Float32Array.from([text.length])
			}));
		(pipeline as jest.Mock).mockResolvedValue(embedderFn);

		const texts = ["a", "", "abc"];
		const res = await embeddingService.generateBatchEmbeddings(texts);

		expect(res).toEqual([[1], [3]]);
	});

	it("cleanup disposes model resources and resets state", async () => {
		// Provide a fake embedder with a model having dispose
		const dispose = jest.fn().mockResolvedValue(undefined);
		(embeddingService as any).embedder = { model: { dispose } };
		(embeddingService as any).initialized = true;

		await embeddingService.cleanup();

		expect(dispose).toHaveBeenCalled();
		expect(embeddingService.isInitialized()).toBe(false);
	});
});
