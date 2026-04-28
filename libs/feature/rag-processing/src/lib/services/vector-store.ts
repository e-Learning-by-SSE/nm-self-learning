import { ChromaClient, Collection, EmbeddingFunction, registerEmbeddingFunction } from "chromadb";
import { RAG_CONFIG } from "../config/rag-config";
import { DocumentChunk, RetrievalResult, CircuitBreakerState } from "../types/chunk";
import type { IEmbeddingService } from "../types/embedding";

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
 * ChromaDB 3.x resolves whether to warn about a missing embedding function by calling
 * `serializeEmbeddingFunction` on the instance passed to getCollection/createCollection.
 * It returns `{ type: "legacy" }` — triggering the warning — whenever the instance is
 * missing `getConfig` or `buildFromConfig`. Implementing those two methods (plus
 * registering the class under its name) makes the client serialize it as
 * `{ type: "known", name: "custom-direct-embeddings", config: {} }`, which suppresses
 * the warning without any console patching.
 *
 * `generate()` intentionally throws: we always pass pre-computed embeddings directly
 * to `add()` and `query()`, so ChromaDB should never call this.
 */
class CustomEmbeddingFunction implements EmbeddingFunction {
	public static readonly FUNCTION_NAME = "custom-direct-embeddings";
	public name = CustomEmbeddingFunction.FUNCTION_NAME;

	async generate(): Promise<number[][]> {
		throw new Error(
			"CustomEmbeddingFunction.generate() should never be called. " +
				"Always pass embeddings directly to add() and query()."
		);
	}

	getConfig(): Record<string, never> {
		return {};
	}

	static buildFromConfig(): CustomEmbeddingFunction {
		return new CustomEmbeddingFunction();
	}
}

// Register once so the client can round-trip the config through the known-function registry.
registerEmbeddingFunction(CustomEmbeddingFunction.FUNCTION_NAME, CustomEmbeddingFunction as never);

const CUSTOM_EMBEDDING_FUNCTION = new CustomEmbeddingFunction();

/**
 * Service for managing vector storage and retrieval using ChromaDB
 */
export class VectorStore {
	private client: ChromaClient | null = null;
	private initialized = false;
	private circuitBreaker: CircuitBreakerState = { failureCount: 0, isOpen: false };
	private _embeddingService: IEmbeddingService | null = null;
	/**
	 * Lazily load the embedding service.
	 * Using a dynamic import means @xenova/transformers is only parsed when
	 * this method is first called at runtime — never during Jest module loading.
	 */
	private async getEmbeddingService(): Promise<IEmbeddingService> {
		if (!this._embeddingService) {
			const { embeddingService } = await import("./embedding");
			this._embeddingService = embeddingService;
		}
		return this._embeddingService;
	}

	/**
	 * Initialize connection to ChromaDB
	 */
	async initialize(onlyChroma: boolean): Promise<void> {
		if (this.initialized) {
			return;
		}
		try {
			this.client = new ChromaClient({
				host: RAG_CONFIG.VECTOR_STORE.HOST,
				port: RAG_CONFIG.VECTOR_STORE.PORT,
				ssl: RAG_CONFIG.VECTOR_STORE.USE_SSL
			});

			if (!onlyChroma) {
				const embeddingService = await this.getEmbeddingService();
				await embeddingService.initialize();
			}

			this.initialized = true;
		} catch (error) {
			console.error("[VectorStore] VectorStore initialization failed", {
				error: error instanceof Error ? error.message : String(error)
			});
			throw new Error("Failed to connect to ChromaDB");
		}
	}

	/**
	 * Check if initialized
	 */
	isInitialized(): boolean {
		return this.initialized;
	}

	/**
	 * Check circuit breaker state
	 */
	private checkCircuitBreaker(): void {
		if (this.circuitBreaker.isOpen) {
			throw new Error("ChromaDB circuit breaker is open due to repeated failures");
		}
	}

	/**
	 * Record successful operation
	 */
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

	/**
	 * Get or create collection for a lesson
	 */
	private async getCollection(lessonId: string): Promise<Collection> {
		if (!this.client) {
			throw new Error("VectorStore not initialized");
		}

		const collectionName = `${RAG_CONFIG.VECTOR_STORE.COLLECTION_PREFIX}${lessonId}`;

		return await this.client.getOrCreateCollection({
			name: collectionName,
			embeddingFunction: CUSTOM_EMBEDDING_FUNCTION,
			metadata: {
				description: `Lesson ${lessonId} documents`,
				// Tells the ChromaDB server which embedding function this collection uses
				// during schema deserialization, suppressing the "No embedding function
				// configuration found" warning that is otherwise printed on every collection load.
				embedding_function: CUSTOM_EMBEDDING_FUNCTION.name,
				custom_embeddings: "true",
				embedding_model: RAG_CONFIG.EMBEDDING.MODEL_NAME,
				"hnsw:space": "cosine"
			}
		});
	}

	/**
	 * Add document chunks to vector store
	 */
	async addDocuments(lessonId: string, chunks: DocumentChunk[]): Promise<void> {
		this.checkCircuitBreaker();

		try {
			await this.initialize(false);
			const embeddingService = await this.getEmbeddingService();
			const collection = await this.getCollection(lessonId);
			const batchSize = RAG_CONFIG.EMBEDDING.BATCH_SIZE;

			for (let i = 0; i < chunks.length; i += batchSize) {
				const batch = chunks.slice(i, i + batchSize);

				// Generate embeddings for batch
				const texts = batch.map(chunk => chunk.text);
				const embeddings = await embeddingService.generateBatchEmbeddings(texts);

				// Add to collection
				await collection.add({
					ids: batch.map(chunk => chunk.id),
					embeddings: embeddings,
					documents: texts,
					metadatas: batch.map(chunk => toChromaMetadata(chunk.metadata))
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
	 * Search for relevant documents
	 */
	async search(lessonId: string, query: string, topK = 5): Promise<RetrievalResult[]> {
		await this.initialize(false);
		const embeddingService = await this.getEmbeddingService();
		const actualTopK = Math.min(topK, RAG_CONFIG.RETRIEVAL.MAX_TOP_K);
		try {
			const collection = await this.getCollection(lessonId);

			// Generate query embedding
			const queryEmbedding = await embeddingService.generateEmbedding(query);

			// Search
			const results = await collection.query({
				queryEmbeddings: [queryEmbedding],
				nResults: actualTopK
			});

			if (!results.documents[0] || !results.metadatas[0] || !results.distances[0]) {
				return [];
			}

			// Convert to retrieval results
			const retrievalResults: RetrievalResult[] = results.documents[0].map((text, idx) => {
				const distance = results.distances?.[0]?.[idx] ?? 1;
				const score = 1 - distance;
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

			// Filter by minimum similarity score
			const filtered = retrievalResults.filter(
				result => result.score >= RAG_CONFIG.RETRIEVAL.MIN_SIMILARITY_SCORE
			);

			return filtered;
		} catch (error) {
			console.error("[VectorStore] Search failed", {
				error: error instanceof Error ? error.message : String(error),
				lessonId
			});
			throw error;
		}
	}

	/**
	 * Delete a lesson's collection
	 */
	async deleteLesson(lessonId: string): Promise<void> {
		await this.initialize(true);

		const collectionName = `${RAG_CONFIG.VECTOR_STORE.COLLECTION_PREFIX}${lessonId}`;

		try {
			await this.client?.deleteCollection({ name: collectionName });
		} catch {
			console.error("[VectorStore] Collection not found or already deleted", {
				lessonId,
				collectionName
			});
		}
	}

	/**
	 * Check if lesson collection exists
	 */
	async lessonExists(lessonId: string): Promise<boolean> {
		await this.initialize(true);

		const collectionName = `${RAG_CONFIG.VECTOR_STORE.COLLECTION_PREFIX}${lessonId}`;

		const collection = await this.client?.getCollection({
			name: collectionName,
			embeddingFunction: CUSTOM_EMBEDDING_FUNCTION
		});
		return !!collection;
	}

	/**
	 * Cleanup resources
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
