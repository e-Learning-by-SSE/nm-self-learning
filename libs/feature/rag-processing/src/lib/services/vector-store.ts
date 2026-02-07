import { ChromaClient, Collection } from "chromadb";
import { RAG_CONFIG } from "../config/rag-config";
import { DocumentChunk, RetrievalResult } from "../types/chunk";
import { embeddingService } from "./embedding";

/**
 * Chromadb metadata must be flat key-value pairs
 */
type ChromaMetadata = Record<string, string | number | boolean>;

/**
 * Convert chunk metadata to ChromaDB-compatible format
 */
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
 * Circuit breaker state
 */
interface CircuitBreakerState {
	failureCount: number;
	isOpen: boolean;
	lastFailure?: Date;
}

/**
 * Service for managing vector storage and retrieval using ChromaDB
 */
export class VectorStore {
	private client: ChromaClient | null = null;
	private initialized = false;
	private circuitBreaker: CircuitBreakerState = { failureCount: 0, isOpen: false };

	/**
	 * Initialize connection to ChromaDB
	 */
	async initialize(): Promise<void> {
		if (this.initialized) {
			console.log("[VectorStore] VectorStore already initialized");
			return;
		}

		console.log("[VectorStore] Connecting to ChromaDB", {
			host: RAG_CONFIG.VECTOR_STORE.HOST,
			port: RAG_CONFIG.VECTOR_STORE.PORT
		});

		try {
			this.client = new ChromaClient({
				path: `http://${RAG_CONFIG.VECTOR_STORE.HOST}:${RAG_CONFIG.VECTOR_STORE.PORT}`
			});

			// Initialize embedding service as well
			await embeddingService.initialize();

			this.initialized = true;
			console.log("[VectorStore] VectorStore initialized successfully");
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
			return await this.client.getCollection({ name: collectionName });
		} catch {
			console.log("[VectorStore] Collection not found, creating new one", { collectionName });
			return await this.client.createCollection({
				name: collectionName,
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
			await this.initialize();

			console.log("[VectorStore] Adding documents to vector store", {
				lessonId,
				chunkCount: chunks.length
			});

			const collection = await this.getCollection(lessonId);
			const batchSize = RAG_CONFIG.EMBEDDING.BATCH_SIZE;
			const totalBatches = Math.ceil(chunks.length / batchSize);

			for (let i = 0; i < chunks.length; i += batchSize) {
				const batch = chunks.slice(i, i + batchSize);
				const batchNumber = Math.floor(i / batchSize) + 1;

				console.log("[VectorStore] Processing batch", {
					batch: batchNumber,
					total: totalBatches,
					size: batch.length
				});

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

				console.log("[VectorStore] Batch added successfully", { batch: batchNumber });
			}

			this.recordSuccess();
			console.log("[VectorStore] All documents added successfully", {
				lessonId,
				chunkCount: chunks.length
			});
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
		await this.initialize();

		const actualTopK = Math.min(topK, RAG_CONFIG.RETRIEVAL.MAX_TOP_K);

		console.log("[VectorStore] Searching documents", { lessonId });

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
				console.log("[VectorStore] No results found", {
					lessonId,
					query: query.substring(0, 50)
				});
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

			console.log("[VectorStore] Search completed", {
				lessonId,
				resultsFound: filtered.length,
				query: query.substring(0, 50)
			});

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
		await this.initialize();

		const collectionName = `${RAG_CONFIG.VECTOR_STORE.COLLECTION_PREFIX}${lessonId}`;

		try {
			await this.client?.deleteCollection({ name: collectionName });
			console.log("[VectorStore] Lesson collection deleted", { lessonId, collectionName });
		} catch {
			console.log("[VectorStore] Collection not found or already deleted", {
				lessonId,
				collectionName
			});
		}
	}

	/**
	 * Check if lesson collection exists
	 */
	async lessonExists(lessonId: string): Promise<boolean> {
		await this.initialize();

		const collectionName = `${RAG_CONFIG.VECTOR_STORE.COLLECTION_PREFIX}${lessonId}`;

		try {
			await this.client?.getCollection({ name: collectionName });
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
					console.log("[VectorStore] Collection deleted", { name: col.name });
				}
			} catch (error) {
				console.log("[VectorStore] Error during cleanup", { error });
			}

			this.client = null;
			this.initialized = false;
			console.log("[VectorStore] VectorStore resources cleaned up");
		}
	}
}

export const vectorStore = new VectorStore();
