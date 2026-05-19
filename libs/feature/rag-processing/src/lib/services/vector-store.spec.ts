jest.mock("../config/rag-config", () => ({
	RAG_CONFIG: {
		VECTOR_STORE: {
			HOST: "localhost",
			PORT: 8000,
			USE_SSL: false,
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
	ChromaClient: jest.fn(),
	knownEmbeddingFunctions: { has: jest.fn().mockReturnValue(true) },
	registerEmbeddingFunction: jest.fn()
}));

import { ChromaClient } from "chromadb";
import { vectorStore } from "./vector-store";
import type { IEmbeddingService } from "../types/embedding";
import type { PDFChunk } from "../types/chunk";

// ---------------------------------------------------------------------------
// Embedding service stub
//
// vector-store.ts has no static import of embedding.ts, so we must not import
// it here either — doing so would load @xenova/transformers at module evaluation
// time, which crashes Jest's CJS transform with a __dirname redeclaration error.
// A plain object that satisfies IEmbeddingService is sufficient for all tests.
// ---------------------------------------------------------------------------

const embeddingService: IEmbeddingService = {
	initialize: jest.fn(),
	isInitialized: jest.fn().mockReturnValue(false),
	generateEmbedding: jest.fn(),
	generateBatchEmbeddings: jest.fn()
};

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
	delete: jest.MockedFunction<(args: { where: Record<string, string> }) => Promise<void>>;
	get: jest.MockedFunction<
		(args: {
			where: Record<string, string>;
			limit: number;
			include: never[];
		}) => Promise<{ ids: string[] }>
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
	getOrCreateCollection: jest.MockedFunction<
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

		// Reset the embedding service stub so spies from previous tests don't bleed over.
		(embeddingService.initialize as jest.Mock).mockReset();
		(embeddingService.generateEmbedding as jest.Mock).mockReset();
		(embeddingService.generateBatchEmbeddings as jest.Mock).mockReset();

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
			}),
			delete: jest.fn().mockResolvedValue(undefined),
			get: jest.fn().mockResolvedValue({ ids: [] })
		};

		clientMock = {
			getOrCreateCollection: jest.fn().mockResolvedValue(collectionMock),
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

		it("connects to ChromaDB and marks the store as initialized", async () => {
			// Exercise
			await vectorStore.initialize();

			// Verify
			expect(ChromaClient as unknown as jest.Mock).toHaveBeenCalled();
			expect(vectorStore.isInitialized()).toBe(true);
		});

		it("does not reconnect when already initialized", async () => {
			// Setup
			await vectorStore.initialize();
			(ChromaClient as unknown as jest.Mock).mockClear();

			// Exercise
			await vectorStore.initialize();

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
			await vectorStore.addDocuments("l1", chunks, embeddingService);

			// Verify
			expect(embeddingsSpy).toHaveBeenCalled();
			expect(collectionMock.add).toHaveBeenCalledTimes(1);
			const addArgs = collectionMock.add.mock.calls[0][0];
			expect(addArgs.ids).toEqual(["c1", "c2"]);
			expect(addArgs.documents).toEqual(["text a", "text b"]);
		});

		it("splits chunks into batches of BATCH_SIZE", async () => {
			// Setup – BATCH_SIZE is 2; supply 3 chunks to force two batches
			jest.spyOn(embeddingService, "generateBatchEmbeddings").mockResolvedValue([[1], [2]]);

			const chunks: PDFChunk[] = [
				makePdfChunk("c1", "text a", 0),
				makePdfChunk("c2", "text b", 1),
				makePdfChunk("c3", "text c", 2)
			];

			// Exercise
			await vectorStore.addDocuments("l1", chunks, embeddingService);

			// Verify – two batches means two collection.add calls
			expect(collectionMock.add).toHaveBeenCalledTimes(2);
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
			await vectorStore.initialize();

			// Exercise
			const results = await vectorStore.search("l1", "query", embeddingService, 5);

			// Verify
			expect(collectionMock.query).toHaveBeenCalled();
			expect(results).toHaveLength(2);
			expect(results[0]).toHaveProperty("text", "doc1");
			expect(results[0]).toHaveProperty("score", 0.9);
			expect(results[0]).toHaveProperty("metadata");
		});

		it("returns an empty array when ChromaDB returns no documents", async () => {
			// Setup
			jest.spyOn(embeddingService, "generateEmbedding").mockResolvedValue([0.5]);
			collectionMock.query.mockResolvedValue({
				documents: [[]],
				metadatas: [[]],
				distances: [[]]
			});
			await vectorStore.initialize();

			// Exercise
			const results = await vectorStore.search("l1", "no results", embeddingService, 5);

			// Verify
			expect(results).toEqual([]);
		});
	});

	// =========================================================================
	describe("lessonExists", () => {
		// =========================================================================

		it("returns true when the collection contains at least one chunk for the lesson", async () => {
			// Setup
			collectionMock.get.mockResolvedValueOnce({ ids: ["chunk-1"] });
			await vectorStore.initialize();

			// Exercise
			const exists = await vectorStore.lessonExists("l1");

			// Verify
			expect(exists).toBe(true);
		});

		it("returns false when no chunks are found for the lesson", async () => {
			// Setup – default mock already returns { ids: [] }
			await vectorStore.initialize();

			// Exercise
			const exists = await vectorStore.lessonExists("l2");

			// Verify
			expect(exists).toBe(false);
		});
	});

	// =========================================================================
	describe("deleteLesson", () => {
		// =========================================================================

		it("calls collection.delete with the correct lessonId filter", async () => {
			// Setup
			await vectorStore.initialize();

			// Exercise
			await vectorStore.deleteLesson("l1");

			// Verify
			expect(collectionMock.delete).toHaveBeenCalledWith(
				expect.objectContaining({ where: { lessonId: "l1" } })
			);
		});

		it("does not throw when collection.delete rejects", async () => {
			// Setup
			collectionMock.delete.mockRejectedValueOnce(new Error("delete failed"));
			await vectorStore.initialize();

			// Exercise & Verify
			await expect(vectorStore.deleteLesson("missing")).resolves.toBeUndefined();
		});
	});
});
