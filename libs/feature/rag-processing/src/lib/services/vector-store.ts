import { ChromaClient, Collection, EmbeddingFunction } from "chromadb";
import { RAG_CONFIG } from "../config/rag-config";
import { DocumentChunk, RetrievalResult, CircuitBreakerState } from "../types/chunk";
import type { IEmbeddingService } from "../types/embedding";

// ChromaDB's JS client emits this warning whenever it deserializes a collection
// that was stored without a named embedding function — which is always the case
// here because we supply embeddings directly. The warning is harmless noise.
const _originalWarn = console.warn.bind(console);
console.warn = (...args: unknown[]) => {
	const msg = typeof args[0] === "string" ? args[0] : "";
	if (msg.startsWith("No embedding function configuration found")) return;
	_originalWarn(...args);
};

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
 * ChromaDB's collections can be configured with a custom embedding function, but since we're generating
 * embeddings separately and passing them in directly, we provide a no-op function that throws if called.
 * This ensures that if ChromaDB tries to call it for any reason, we'll get a clear error instead of silent
 * failures or incorrect behavior.
 *
 * This will suppresses all the warnings about missing embedding function in ChromaDB.
 */
class CustomEmbeddingFunction implements EmbeddingFunction {
	public name = "custom";

	async generate(): Promise<number[][]> {
		throw new Error(
			"CustomEmbeddingFunction.generate() should never be called. " +
				"Always pass embeddings directly to add() and query()."
		);
	}
}

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
			console.error("[VectorStore] VectorStore initialization failed", error);
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

		try {
			return await this.client.getCollection({
				name: collectionName,
				embeddingFunction: CUSTOM_EMBEDDING_FUNCTION
			});
		} catch {
			return await this.client.createCollection({
				name: collectionName,
				embeddingFunction: CUSTOM_EMBEDDING_FUNCTION,
				metadata: {
					description: `Lesson ${lessonId} documents`,
					custom_embeddings: "true",
					embedding_model: RAG_CONFIG.EMBEDDING.MODEL_NAME,
					"hnsw:space": "cosine"
				}
			});
		}
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
			console.error("[VectorStore] Failed to add documents", error, { lessonId });
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
			console.error("[VectorStore] Search failed", error, { lessonId });
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

		try {
			await this.client?.getCollection({
				name: collectionName,
				embeddingFunction: CUSTOM_EMBEDDING_FUNCTION
			});
			return true;
		} catch {
			return false;
		}
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
				console.error("[VectorStore] Error during cleanup", { error });
			}

			this.client = null;
			this.initialized = false;
		}
	}
}

export const vectorStore = new VectorStore();