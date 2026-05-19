import {
	ChromaClient,
	Collection,
	EmbeddingFunction,
	registerEmbeddingFunction,
	knownEmbeddingFunctions
} from "chromadb";
import { RAG_CONFIG } from "../config/rag-config";
import { DocumentChunk, RetrievalResult, CircuitBreakerState } from "../types/chunk";
import type { IEmbeddingService } from "../types/embedding";

// IEmbeddingService is a compile-time-only import (import type). It adds no runtime
// dependency on embedding.ts or @xenova/transformers, so this module is safe to load
// in any process — including the API server — without triggering the ESM parse error
// that @xenova/transformers causes under Jest's CJS transform.

type ChromaMetadata = Record<string, string | number | boolean>;

function toChromaMetadata(metadata: DocumentChunk["metadata"]): ChromaMetadata {
	const base: ChromaMetadata = {
		lessonId: metadata.lessonId,
		lessonName: metadata.lessonName,
		chunkIndex: metadata.chunkIndex,
		sourceType: metadata.sourceType
	};

	if ("pageNumber" in metadata) {
		base["pageNumber"] = metadata.pageNumber;
	}

	if ("articleIndex" in metadata) {
		base["articleIndex"] = metadata.articleIndex;
	}

	if ("videoIndex" in metadata) {
		base["videoIndex"] = metadata.videoIndex;
	}

	return base;
}

/**
 * Satisfies the ChromaDB 3.x embedding-function contract without pulling in any ML model.
 *
 * ChromaDB resolves whether to warn about a missing embedding function by calling
 * `serializeEmbeddingFunction` on the instance passed to getCollection/createCollection.
 * It returns `{ type: "legacy" }` — triggering a console warning — whenever the instance
 * is missing `getConfig` or `buildFromConfig`. Implementing those two methods (plus
 * registering the class under its name) makes the client serialize it as
 * `{ type: "known", name: "custom-direct-embeddings", config: {} }`, suppressing the
 * warning without any console patching.
 *
 * `generate()` intentionally throws: embeddings are always computed externally and passed
 * directly to `add()` / `query()`, so ChromaDB must never call this method itself.
 */
class CustomEmbeddingFunction implements EmbeddingFunction {
	public static readonly FUNCTION_NAME = "custom-direct-embeddings";
	public name = CustomEmbeddingFunction.FUNCTION_NAME;

	async generate(): Promise<number[][]> {
		throw new Error(
			"CustomEmbeddingFunction.generate() must never be called. " +
				"Always pass pre-computed embeddings directly to add() and query()."
		);
	}

	getConfig(): Record<string, never> {
		return {};
	}

	static buildFromConfig(): CustomEmbeddingFunction {
		return new CustomEmbeddingFunction();
	}
}

// Register once so ChromaDB can round-trip the config through its known-function registry.
// The guard prevents a ChromaValueError on double-registration, which can happen when
// Next.js hot-reload or multiple compilations re-evaluate this module while the ChromaDB
// registry Map persists in the same process.
if (!knownEmbeddingFunctions.has(CustomEmbeddingFunction.FUNCTION_NAME)) {
	registerEmbeddingFunction(
		CustomEmbeddingFunction.FUNCTION_NAME,
		CustomEmbeddingFunction as never
	);
}

const CUSTOM_EMBEDDING_FUNCTION = new CustomEmbeddingFunction();

/**
 * Service for managing vector storage and retrieval using ChromaDB.
 *
 * This class deliberately has no static dependency on the embedding service or
 * @xenova/transformers. Methods that need embeddings (`addDocuments`, `search`)
 * receive an `IEmbeddingService` as an explicit parameter. Methods that only
 * manage ChromaDB collections (`deleteLesson`, `lessonExists`, `cleanup`) need
 * no embedding model at all.
 *
 * This separation means the module is safe to import from any process — including
 * the Next.js API server — without loading the ML model or triggering ESM parse
 * errors in Jest.
 */
export class VectorStore {
	private client: ChromaClient | null = null;
	private initialized = false;
	private circuitBreaker: CircuitBreakerState = {
		failureCount: 0,
		isOpen: false
	};
	// TODO: implement half-open reset logic
	private readonly CIRCUIT_RESET_MS = 30_000;

	/**
	 * Initialize the ChromaDB connection.
	 *
	 * Initialising the embedding model is the caller's responsibility; pass the
	 * initialised service to `addDocuments` or `search` when you need it.
	 */
	async initialize(): Promise<void> {
		if (this.initialized) {
			return;
		}
		try {
			this.client = new ChromaClient({
				host: RAG_CONFIG.VECTOR_STORE.HOST,
				port: RAG_CONFIG.VECTOR_STORE.PORT,
				ssl: RAG_CONFIG.VECTOR_STORE.USE_SSL
			});

			this.initialized = true;
		} catch (error) {
			console.error("[VectorStore] VectorStore initialization failed", {
				error: error instanceof Error ? error.message : String(error)
			});
			throw new Error("Failed to connect to ChromaDB");
		}
	}

	/**
	 * Returns true when the ChromaDB client has been successfully connected.
	 */
	isInitialized(): boolean {
		return this.initialized;
	}

	/**
	 * Throws when the circuit breaker is open, otherwise returns.
	 * If the breaker has been open longer than CIRCUIT_RESET_MS it is
	 * reset to closed (half-open) so the next call can probe the server.
	 */
	private checkCircuitBreaker(): void {
		if (this.circuitBreaker.isOpen) {
			const elapsed = Date.now() - (this.circuitBreaker.lastFailure?.getTime() ?? 0);
			if (elapsed > this.CIRCUIT_RESET_MS) {
				this.circuitBreaker.isOpen = false; // half-open: allow one probe
			} else {
				throw new Error(
					"ChromaDB circuit breaker is open due to repeated failures. Skipping operation."
				);
			}
		}
	}

	private recordSuccess(): void {
		this.circuitBreaker.failureCount = 0;
		this.circuitBreaker.isOpen = false;
	}

	/**
	 * Record failed operation
	 */
	private recordFailure(): void {
		this.circuitBreaker.failureCount++;
		this.circuitBreaker.lastFailure = new Date();

		if (this.circuitBreaker.failureCount >= RAG_CONFIG.VECTOR_STORE.MAX_FAILURES) {
			this.circuitBreaker.isOpen = true;
			console.error("[VectorStore] Circuit breaker opened", {
				failures: this.circuitBreaker.failureCount
			});
		}
	}

	private getSharedCollectionName(): string {
		return "SelfLearn_Shared_VectorStore";
	}

	/**
	 * Returns the ChromaDB collection for the given lesson, creating it if it does not exist.
	 */
	private async getCollection(): Promise<Collection> {
		if (!this.client) {
			throw new Error("VectorStore not initialized");
		}

		return await this.client.getOrCreateCollection({
			name: this.getSharedCollectionName(),
			embeddingFunction: CUSTOM_EMBEDDING_FUNCTION,
			metadata: {
				description: `All lesson documents`,
				embedding_function: CUSTOM_EMBEDDING_FUNCTION.name,
				custom_embeddings: "true",
				embedding_model: RAG_CONFIG.EMBEDDING.MODEL_NAME,
				"hnsw:space": "cosine"
			}
		});
	}

	/**
	 * Embed and store document chunks for a lesson.
	 *
	 * Chunks are processed in batches of `RAG_CONFIG.EMBEDDING.BATCH_SIZE`.
	 *
	 * @param embeddingService - Caller-supplied embedding service. Accepting it as a
	 *   parameter rather than importing it statically keeps this module free of any
	 *   @xenova/transformers dependency, which would otherwise break Jest in projects
	 *   that import VectorStore without needing the ML model.
	 */
	async addDocuments(
		lessonId: string,
		chunks: DocumentChunk[],
		embeddingService: IEmbeddingService
	): Promise<void> {
		this.checkCircuitBreaker();

		try {
			await this.initialize();
			const collection = await this.getCollection();
			const batchSize = RAG_CONFIG.EMBEDDING.BATCH_SIZE;

			for (let i = 0; i < chunks.length; i += batchSize) {
				const batch = chunks.slice(i, i + batchSize);
				const texts = batch.map(chunk => chunk.text);
				const embeddings = await embeddingService.generateBatchEmbeddings(texts);

				await collection.add({
					ids: batch.map(chunk => chunk.id),
					embeddings: embeddings,
					documents: texts,
					metadatas: batch.map(chunk =>
						toChromaMetadata({
							...chunk.metadata,
							lessonId
						})
					)
				});
			}

			this.recordSuccess();
		} catch (error) {
			this.recordFailure();
			console.error("[VectorStore] Failed to add documents", {
				error: error instanceof Error ? error.message : String(error),
				lessonId
			});
			throw error;
		}
	}

	/**
	 * Search for the most relevant chunks for a free-text query.
	 *
	 * Results are filtered to those whose cosine similarity score meets
	 * `RAG_CONFIG.RETRIEVAL.MIN_SIMILARITY_SCORE`, and capped at `topK`
	 * (bounded by `RAG_CONFIG.RETRIEVAL.MAX_TOP_K`).
	 *
	 * @param embeddingService - Caller-supplied embedding service. Same rationale as
	 *   `addDocuments`: keeping it out of the static import graph means this module
	 *   can be loaded without @xenova/transformers.
	 */
	async search(
		lessonId: string,
		query: string,
		embeddingService: IEmbeddingService,
		topK = 5
	): Promise<RetrievalResult[]> {
		await this.initialize();
		const actualTopK = Math.min(topK, RAG_CONFIG.RETRIEVAL.MAX_TOP_K);
		try {
			const collection = await this.getCollection();
			const queryEmbedding = await embeddingService.generateEmbedding(query);

			const results = await collection.query({
				queryEmbeddings: [queryEmbedding],
				nResults: actualTopK,
				where: { lessonId }
			});

			if (!results.documents[0] || !results.metadatas[0] || !results.distances[0]) {
				return [];
			}

			const retrievalResults: RetrievalResult[] = results.documents[0].map((text, idx) => {
				const distance = results.distances?.[0]?.[idx] ?? 1;
				const score = 1 - distance; // convert cosine distance → similarity
				const metadata = results.metadatas[0][idx];

				return {
					text: text || "",
					score,
					metadata: {
						lessonName: (metadata?.["lessonName"] as string) || "",
						pageNumber: metadata?.["pageNumber"] as number | undefined,
						sourceType:
							(metadata?.["sourceType"] as "pdf" | "article" | "video") || undefined
					}
				};
			});

			return retrievalResults.filter(
				result => result.score >= RAG_CONFIG.RETRIEVAL.MIN_SIMILARITY_SCORE
			);
		} catch (error) {
			console.error("[VectorStore] Search failed", {
				error: error instanceof Error ? error.message : String(error),
				lessonId
			});
			throw error;
		}
	}

	/**
	 * Delete all stored chunks for a lesson.
	 * Silently swallows errors so a missing collection does not fail a lesson deletion.
	 */
	async deleteLesson(lessonId: string): Promise<void> {
		await this.initialize();

		try {
			const collection = await this.getCollection();
			await collection.delete({ where: { lessonId } });
		} catch (error) {
			console.error("[VectorStore] Failed to delete lesson documents", {
				error: error instanceof Error ? error.message : String(error),
				lessonId
			});
		}
	}

	/**
	 * Returns true when at least one chunk for the lesson is present in the vector store.
	 */
	async lessonExists(lessonId: string): Promise<boolean> {
		await this.initialize();

		const collection = await this.getCollection();
		const result = await collection.get({
			where: { lessonId },
			limit: 1,
			include: []
		});

		return result.ids.length > 0;
	}

	/**
	 * Drop all collections and reset the client. Used in tests to ensure a clean state
	 * between runs.
	 */
	async cleanup(): Promise<void> {
		if (this.client) {
			try {
				const collections = await this.client.listCollections();
				for (const col of collections) {
					await this.client.deleteCollection({ name: col.name });
				}
			} catch (error) {
				console.error("[VectorStore] Error during cleanup", {
					error: error instanceof Error ? error.message : String(error)
				});
			}

			this.client = null;
			this.initialized = false;
		}
	}
}

export const vectorStore = new VectorStore();
