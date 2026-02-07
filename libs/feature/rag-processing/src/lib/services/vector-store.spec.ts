// Mock heavy transformers pipeline before importing the service
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

describe("VectorStore", () => {
	let clientMock: any;
	let collectionMock: any;

	beforeEach(async () => {
		jest.clearAllMocks();

		// Reset vectorStore internal state
		try {
			await vectorStore.cleanup();
		} catch {}

		collectionMock = {
			add: jest.fn().mockResolvedValue(undefined),
			query: jest
				.fn()
				.mockResolvedValue({ documents: [[]], metadatas: [[]], distances: [[]] })
		};

		clientMock = {
			getCollection: jest.fn().mockResolvedValue(collectionMock),
			createCollection: jest.fn().mockResolvedValue(collectionMock),
			deleteCollection: jest.fn().mockResolvedValue(undefined),
			listCollections: jest.fn().mockResolvedValue([])
		};

		// Make ChromaClient constructor return our mock client
		(ChromaClient as unknown as jest.Mock).mockImplementation(() => clientMock);
	});

	it("initialize connects to Chroma and initializes embedding when requested", async () => {
		const initSpy = jest
			.spyOn(embeddingService, "initialize")
			.mockResolvedValue(undefined as any);

		await vectorStore.initialize(false);

		expect(ChromaClient as unknown as jest.Mock).toHaveBeenCalled();
		expect(vectorStore.isInitialized()).toBe(true);
		expect(initSpy).toHaveBeenCalled();
	});

	it("initialize with onlyChroma true does not call embedding.initialize", async () => {
		const initSpy = jest
			.spyOn(embeddingService, "initialize")
			.mockResolvedValue(undefined as any);

		await vectorStore.initialize(true);

		expect(initSpy).not.toHaveBeenCalled();
		expect(vectorStore.isInitialized()).toBe(true);
	});

	it("addDocuments generates embeddings and calls collection.add in batches", async () => {
		// mock embeddings for texts
		jest.spyOn(embeddingService, "generateBatchEmbeddings").mockResolvedValue([
			[1],
			[2]
		] as any);

		const chunks = [
			{
				id: "c1",
				text: "a",
				metadata: {
					lessonId: "l1",
					lessonName: "L",
					chunkIndex: 0,
					sourceType: "pdf",
					pageNumber: 1
				}
			},
			{
				id: "c2",
				text: "b",
				metadata: {
					lessonId: "l1",
					lessonName: "L",
					chunkIndex: 1,
					sourceType: "pdf",
					pageNumber: 2
				}
			}
		];

		await vectorStore.addDocuments("l1", chunks as any);

		expect(clientMock.getCollection).toHaveBeenCalled();
		expect(collectionMock.add).toHaveBeenCalledTimes(1);
		const addArgs = collectionMock.add.mock.calls[0][0];
		expect(addArgs.ids).toEqual(["c1", "c2"]);
		expect(addArgs.documents).toEqual(["a", "b"]);
	});

	it("search returns mapped RetrievalResult entries", async () => {
		// make embedding return a vector
		jest.spyOn(embeddingService, "generateEmbedding").mockResolvedValue([0.1, 0.2] as any);

		// prepare query result: two docs
		collectionMock.query.mockResolvedValue({
			documents: [["doc1", "doc2"]],
			metadatas: [
				[
					{ lessonName: "L1", pageNumber: 1, sourceType: "pdf" },
					{ lessonName: "L1", pageNumber: 2, sourceType: "article" }
				]
			],
			distances: [[0.1, 0.2]]
		});

		await vectorStore.initialize(true);
		const results = await vectorStore.search("l1", "query", 5);

		expect(collectionMock.query).toHaveBeenCalled();
		expect(Array.isArray(results)).toBe(true);
		expect(results.length).toBeGreaterThanOrEqual(0);
		if (results.length > 0) {
			expect(results[0]).toHaveProperty("text");
			expect(results[0]).toHaveProperty("score");
			expect(results[0]).toHaveProperty("metadata");
		}
	});

	it("lessonExists returns true when collection exists and false otherwise", async () => {
		clientMock.getCollection.mockResolvedValueOnce({});
		await vectorStore.initialize(true);
		await expect(vectorStore.lessonExists("l1")).resolves.toBe(true);

		// simulate getCollection throwing -> not exists
		clientMock.getCollection.mockImplementationOnce(() => {
			throw new Error("not found");
		});
		await expect(vectorStore.lessonExists("l2")).resolves.toBe(false);
	});

	it("deleteLesson calls deleteCollection and does not throw if missing", async () => {
		await vectorStore.initialize(true);
		await expect(vectorStore.deleteLesson("l1")).resolves.toBeUndefined();
		expect(clientMock.deleteCollection).toHaveBeenCalledWith({
			name: expect.stringContaining("l1")
		});
	});
});
