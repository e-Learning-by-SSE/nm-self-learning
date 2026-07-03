// Mock the heavy @huggingface/transformers pipeline before importing the service so
// the real model is never loaded during tests.
jest.mock("@huggingface/transformers", () => ({
	pipeline: jest.fn()
}));

import { pipeline } from "@huggingface/transformers";
import { embeddingService, EmbeddingService } from "./embedding";

// ---------------------------------------------------------------------------
// Type helpers – avoid "any" throughout the test file
// ---------------------------------------------------------------------------

/** Shape returned by the Xenova pipeline function for feature-extraction tasks. */
interface PipelineOutput {
	data: Float32Array;
}

/** Minimal shape of the embedder callable returned by `pipeline()`. */
type EmbedderFn = jest.MockedFunction<
	(text: string, options: Record<string, unknown>) => Promise<PipelineOutput>
>;

/** Accessor into private EmbeddingService fields for teardown / state injection. */
interface EmbeddingServicePrivate {
	embedder: { model: { dispose: () => Promise<void> } } | null;
	initialized: boolean;
}

// ---------------------------------------------------------------------------
// EmbeddingService tests
// ---------------------------------------------------------------------------

describe("EmbeddingService", () => {
	beforeEach(async () => {
		jest.clearAllMocks();

		// Teardown – reset any state carried over from previous tests.
		// Uses a typed cast instead of "as any" to keep the compiler happy.
		await (embeddingService as unknown as EmbeddingService & { cleanup(): Promise<void> })
			.cleanup()
			.catch(() => {
				// Ignore cleanup errors on a fresh service instance.
			});
	});

	// =========================================================================
	describe("initialize", () => {
		// =========================================================================

		it("loads the model via pipeline and marks the service as initialized", async () => {
			// Setup
			const embedderFn: EmbedderFn = jest
				.fn()
				.mockResolvedValue({ data: Float32Array.from([0.1, 0.2, 0.3]) });
			(pipeline as jest.Mock).mockResolvedValue(embedderFn);

			// Exercise
			await embeddingService.initialize();

			// Verify
			expect(embeddingService.isInitialized()).toBe(true);
			expect(pipeline).toHaveBeenCalledWith(
				"feature-extraction",
				expect.any(String),
				expect.objectContaining({ dtype: expect.stringMatching("q8") })
			);
		});

		it("does not call pipeline a second time when already initialized", async () => {
			// Setup
			const embedderFn: EmbedderFn = jest
				.fn()
				.mockResolvedValue({ data: Float32Array.from([0.1]) });
			(pipeline as jest.Mock).mockResolvedValue(embedderFn);
			await embeddingService.initialize();
			(pipeline as jest.Mock).mockClear();

			// Exercise
			await embeddingService.initialize();

			// Verify – pipeline must not be called again
			expect(pipeline).not.toHaveBeenCalled();
		});
	});

	// =========================================================================
	describe("generateEmbedding", () => {
		// =========================================================================

		it("returns a numeric array whose values reflect the model output", async () => {
			// Setup – embedder returns a vector whose values depend on text length
			const embedderFn: EmbedderFn = jest.fn().mockImplementation(async (text: string) => ({
				data: Float32Array.from([text.length, text.length + 1])
			}));
			(pipeline as jest.Mock).mockResolvedValue(embedderFn);

			// Exercise
			const result = await embeddingService.generateEmbedding("hello");

			// Verify
			expect(Array.isArray(result)).toBe(true);
			expect(result).toEqual([5, 6]);
			expect(embedderFn).toHaveBeenCalledWith(
				"hello",
				expect.objectContaining({
					pooling: expect.any(String),
					normalize: expect.any(Boolean)
				})
			);
		});

		it("throws when the input text is empty or whitespace-only", async () => {
			// Setup
			const embedderFn: EmbedderFn = jest
				.fn()
				.mockResolvedValue({ data: Float32Array.from([1]) });
			(pipeline as jest.Mock).mockResolvedValue(embedderFn);

			// Exercise & Verify
			await expect(embeddingService.generateEmbedding("   ")).rejects.toThrow(
				"Cannot generate embedding for empty text"
			);
		});

		it("auto-initialises the model when called before explicit initialize()", async () => {
			// Setup – service is already reset in beforeEach
			const embedderFn: EmbedderFn = jest
				.fn()
				.mockResolvedValue({ data: Float32Array.from([0.5]) });
			(pipeline as jest.Mock).mockResolvedValue(embedderFn);

			// Exercise
			const result = await embeddingService.generateEmbedding("auto-init");

			// Verify
			expect(embeddingService.isInitialized()).toBe(true);
			expect(result).toEqual([0.5]);
		});
	});

	// =========================================================================
	describe("generateBatchEmbeddings", () => {
		// =========================================================================

		it("returns one embedding per input text, preserving 1-to-1 alignment", async () => {
			// Setup
			const embedderFn: EmbedderFn = jest.fn().mockImplementation(async (text: string) => ({
				data: Float32Array.from([text.length])
			}));
			(pipeline as jest.Mock).mockResolvedValue(embedderFn);
			const texts = ["a", "ab", "abc"];

			// Exercise
			const result = await embeddingService.generateBatchEmbeddings(texts);

			// Verify – output length always matches input length
			expect(result).toHaveLength(texts.length);
			expect(result).toEqual([[1], [2], [3]]);
		});

		it("throws when a batch entry is empty, keeping the same contract as generateEmbedding", async () => {
			// Setup
			const embedderFn: EmbedderFn = jest
				.fn()
				.mockResolvedValue({ data: Float32Array.from([1]) });
			(pipeline as jest.Mock).mockResolvedValue(embedderFn);

			// Exercise & Verify – silently skipping blank entries would shorten the
			// returned array, breaking the ids/embeddings/documents alignment in
			// VectorStore.addDocuments. Throwing is the safe, explicit contract.
			await expect(
				embeddingService.generateBatchEmbeddings(["hello", "", "world"])
			).rejects.toThrow("Cannot generate embedding for empty text");

			await expect(embeddingService.generateBatchEmbeddings(["   "])).rejects.toThrow(
				"Cannot generate embedding for empty text"
			);
		});

		it("returns an empty array when the input list is empty", async () => {
			// Setup
			const embedderFn: EmbedderFn = jest
				.fn()
				.mockResolvedValue({ data: Float32Array.from([1]) });
			(pipeline as jest.Mock).mockResolvedValue(embedderFn);

			// Exercise
			const result = await embeddingService.generateBatchEmbeddings([]);

			// Verify
			expect(result).toEqual([]);
			expect(embedderFn).not.toHaveBeenCalled();
		});
	});

	// =========================================================================
	describe("cleanup", () => {
		// =========================================================================

		it("disposes model resources and resets the initialized flag", async () => {
			// Setup – inject a fake embedder with a trackable dispose method
			const dispose = jest.fn().mockResolvedValue(undefined);
			const servicePrivate = embeddingService as unknown as EmbeddingServicePrivate;
			servicePrivate.embedder = { model: { dispose } };
			servicePrivate.initialized = true;

			// Exercise
			await embeddingService.cleanup();

			// Verify
			expect(dispose).toHaveBeenCalledTimes(1);
			expect(embeddingService.isInitialized()).toBe(false);

			// Teardown – state already reset by cleanup()
		});

		it("does not throw when called on an uninitialised service", async () => {
			// Setup – service is uninitialised from beforeEach

			// Exercise & Verify
			await expect(embeddingService.cleanup()).resolves.toBeUndefined();
		});
	});
});
