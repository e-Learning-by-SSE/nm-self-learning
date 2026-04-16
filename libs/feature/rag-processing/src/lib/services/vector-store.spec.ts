// Mock the heavy @xenova/transformers pipeline before any service import.
jest.mock("@xenova/transformers", () => ({
	pipeline: jest.fn()
}));

jest.mock("../config/rag-config", () => ({
	RAG_CONFIG: {
		VECTOR_STORE: {
			HOST: "localhost",
			PORT: 8000,
			USE_SSL: false,
			COLLECTION_PREFIX: "col_",
			MAX_FAILURES: 3
		},
		EMBEDDING: {
			BATCH_SIZE: 2,
			MODEL_NAME: "m",
			QUANTIZED: false,
			POOLING: "mean",
			NORMALIZE: true
		},
		RETRIEVAL: { MIN_SIMILARITY_SCORE: 0, MAX_TOP_K: 10 }
	}
}));

jest.mock("chromadb", () => ({
	ChromaClient: jest.fn()
}));

import { ChromaClient } from "chromadb";
import { vectorStore } from "./vector-store";
import { embeddingService } from "./embedding";
import type { PDFChunk } from "../types/chunk";

// ---------------------------------------------------------------------------
// Type helpers – no "any" in test code
// ---------------------------------------------------------------------------

/** Minimal ChromaDB Collection mock surface used in tests. */
interface CollectionMock {
	add: jest.MockedFunction<
		(args: {
			ids: string[];
			embeddings: number[][];
			documents: string[];
			metadatas: Record<string, string | number | boolean>[];
		}) => Promise<void>
	>;
	query: jest.MockedFunction<
		(args: { queryEmbeddings: number[][]; nResults: number }) => Promise<ChromaQueryResult>
	>;
}

/** Shape returned by ChromaDB collection.query() used in tests. */
interface ChromaQueryResult {
	documents: (string | null)[][];
	metadatas: (Record<string, string | number | boolean> | null)[][];
	distances: number[][];
}

interface CollectionAddArgs {
	ids: string[];
	embeddings: number[][];
	documents: string[];
	metadatas: Record<string, string | number | boolean>[];
}

interface CollectionQueryArgs {
	queryEmbeddings: number[][];
	nResults: number;
}

/** Minimal ChromaDB Client mock surface used in tests. */
interface ClientMock {
	getCollection: jest.MockedFunction<(args: { name: string }) => Promise<CollectionMock>>;
	createCollection: jest.MockedFunction<
		(args: { name: string; metadata?: Record<string, string> }) => Promise<CollectionMock>
	>;
	deleteCollection: jest.MockedFunction<(args: { name: string }) => Promise<void>>;
	listCollections: jest.MockedFunction<() => Promise<{ name: string }[]>>;
}

// ---------------------------------------------------------------------------
// Test data factories
// ---------------------------------------------------------------------------

function makePdfChunk(id: string, text: string, chunkIndex: number): PDFChunk {
	return {
		id,
		text,
		metadata: {
			lessonId: "l1",
			lessonName: "L",
			chunkIndex,
			sourceType: "pdf",
			pageNumber: chunkIndex + 1
		}
	};
}

// ---------------------------------------------------------------------------
// VectorStore tests
// ---------------------------------------------------------------------------

describe("VectorStore", () => {
	let clientMock: ClientMock;
	let collectionMock: CollectionMock;

	beforeEach(async () => {
		// Setup – reset all mocks and rebuild fresh mock instances.
		jest.clearAllMocks();

		// Teardown of previous test's vector store state.
		await vectorStore.cleanup().catch(() => {
			// Ignore errors – store may not have been initialized yet.
		});

		collectionMock = {
			add: jest.fn<Promise<void>, [CollectionAddArgs]>().mockResolvedValue(undefined),
			query: jest.fn<Promise<ChromaQueryResult>, [CollectionQueryArgs]>().mockResolvedValue({
				documents: [[]],
				metadatas: [[]],
				distances: [[]]
			})
		};

		clientMock = {
			getCollection: jest.fn().mockResolvedValue(collectionMock),
			createCollection: jest.fn().mockResolvedValue(collectionMock),
			deleteCollection: jest.fn().mockResolvedValue(undefined),
			listCollections: jest.fn().mockResolvedValue([])
		};

		(ChromaClient as unknown as jest.MockedClass<typeof ChromaClient>).mockImplementation(
			() => clientMock as unknown as InstanceType<typeof ChromaClient>
		);
	});

	afterEach(async () => {
		// Teardown – ensure a clean slate for the next test.
		await vectorStore.cleanup().catch(() => {});
	});

	// =========================================================================
	describe("initialize", () => {
		// =========================================================================

		it("connects to ChromaDB and also initializes the embedding service when onlyChroma is false", async () => {
			// Setup
			const initSpy = jest.spyOn(embeddingService, "initialize").mockResolvedValue(undefined);

			// Exercise
			await vectorStore.initialize(false);

			// Verify
			expect(ChromaClient as unknown as jest.Mock).toHaveBeenCalled();
			expect(vectorStore.isInitialized()).toBe(true);
			expect(initSpy).toHaveBeenCalledTimes(1);
		});

		it("connects to ChromaDB but skips embedding initialization when onlyChroma is true", async () => {
			// Setup
			const initSpy = jest.spyOn(embeddingService, "initialize").mockResolvedValue(undefined);

			// Exercise
			await vectorStore.initialize(true);

			// Verify
			expect(vectorStore.isInitialized()).toBe(true);
			expect(initSpy).not.toHaveBeenCalled();
		});

		it("does not reconnect when already initialized", async () => {
			// Setup
			jest.spyOn(embeddingService, "initialize").mockResolvedValue(undefined);
			await vectorStore.initialize(true);
			(ChromaClient as unknown as jest.Mock).mockClear();

			// Exercise
			await vectorStore.initialize(true);

			// Verify – ChromaClient constructor must not be called a second time
			expect(ChromaClient as unknown as jest.Mock).not.toHaveBeenCalled();
		});
	});

	// =========================================================================
	describe("addDocuments", () => {
		// =========================================================================

		it("generates embeddings and calls collection.add for every batch of chunks", async () => {
			// Setup
			const embeddingsSpy = jest
				.spyOn(embeddingService, "generateBatchEmbeddings")
				.mockResolvedValue([[1], [2]]);

			const chunks: PDFChunk[] = [
				makePdfChunk("c1", "text a", 0),
				makePdfChunk("c2", "text b", 1)
			];

			// Exercise
			await vectorStore.addDocuments("l1", chunks);

			// Verify
			expect(embeddingsSpy).toHaveBeenCalled();
			expect(collectionMock.add).toHaveBeenCalledTimes(1);
			const addArgs = collectionMock.add.mock.calls[0][0];
			expect(addArgs.ids).toEqual(["c1", "c2"]);
			expect(addArgs.documents).toEqual(["text a", "text b"]);
		});

		it("uses the collection for the supplied lessonId", async () => {
			// Setup
			jest.spyOn(embeddingService, "generateBatchEmbeddings").mockResolvedValue([[1]]);
			const chunks: PDFChunk[] = [makePdfChunk("cx", "some text", 0)];

			// Exercise
			await vectorStore.addDocuments("specific-lesson", chunks);

			// Verify – the collection name must contain the lessonId
			const getArgs = clientMock.getCollection.mock.calls[0][0];
			expect(getArgs.name).toContain("specific-lesson");
		});
	});

	// =========================================================================
	describe("search", () => {
		// =========================================================================

		it("returns mapped RetrievalResult entries for matching documents", async () => {
			// Setup
			jest.spyOn(embeddingService, "generateEmbedding").mockResolvedValue([0.1, 0.2]);

			const queryResult: ChromaQueryResult = {
				documents: [["doc1", "doc2"]],
				metadatas: [
					[
						{ lessonName: "L1", pageNumber: 1, sourceType: "pdf" },
						{ lessonName: "L1", pageNumber: 2, sourceType: "article" }
					]
				],
				distances: [[0.1, 0.2]]
			};
			collectionMock.query.mockResolvedValue(queryResult);

			await vectorStore.initialize(true);

			// Exercise
			const results = await vectorStore.search("l1", "query", 5);

			// Verify
			expect(collectionMock.query).toHaveBeenCalled();
			expect(Array.isArray(results)).toBe(true);

			if (results.length > 0) {
				expect(results[0]).toHaveProperty("text");
				expect(results[0]).toHaveProperty("score");
				expect(results[0]).toHaveProperty("metadata");
			}
		});

		it("returns an empty array when ChromaDB returns no documents", async () => {
			// Setup
			jest.spyOn(embeddingService, "generateEmbedding").mockResolvedValue([0.5]);
			collectionMock.query.mockResolvedValue({
				documents: [[]],
				metadatas: [[]],
				distances: [[]]
			});
			await vectorStore.initialize(true);

			// Exercise
			const results = await vectorStore.search("l1", "no results", 5);

			// Verify
			expect(results).toEqual([]);
		});
	});

	// =========================================================================
	describe("lessonExists", () => {
		// =========================================================================

		it("returns true when getCollection resolves successfully", async () => {
			// Setup
			clientMock.getCollection.mockResolvedValueOnce(collectionMock);
			await vectorStore.initialize(true);

			// Exercise
			const exists = await vectorStore.lessonExists("l1");

			// Verify
			expect(exists).toBe(true);
		});

		it("returns false when getCollection throws (collection absent)", async () => {
			// Setup
			clientMock.getCollection.mockImplementationOnce(() => {
				throw new Error("not found");
			});
			await vectorStore.initialize(true);

			// Exercise
			const exists = await vectorStore.lessonExists("l2");

			// Verify
			expect(exists).toBe(false);
		});
	});

	// =========================================================================
	describe("deleteLesson", () => {
		// =========================================================================

		it("calls deleteCollection with the correct collection name", async () => {
			// Setup
			await vectorStore.initialize(true);

			// Exercise
			await vectorStore.deleteLesson("l1");

			// Verify
			expect(clientMock.deleteCollection).toHaveBeenCalledWith(
				expect.objectContaining({ name: expect.stringContaining("l1") })
			);
		});

		it("does not throw when the collection does not exist", async () => {
			// Setup
			clientMock.deleteCollection.mockRejectedValueOnce(new Error("Collection not found"));
			await vectorStore.initialize(true);

			// Exercise & Verify
			await expect(vectorStore.deleteLesson("missing")).resolves.toBeUndefined();
		});
	});
});
