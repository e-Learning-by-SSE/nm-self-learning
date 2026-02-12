import { pipeline } from "@xenova/transformers";
import { RAG_CONFIG } from "../config/rag-config";
import { IEmbeddingService } from "../types/embedding";

/**
 * Service for generating text embeddings using transformers
 *
 * Uses the Xenova/transformers library with a pre-trained model
 * to generate vector embeddings for text content.
 */
export class EmbeddingService implements IEmbeddingService {
	private embedder: any = null;
	private initialized = false;

	/**
	 * Initialize the embedding model
	 * Must be called before generating embeddings
	 */
	async initialize(): Promise<void> {
		if (this.initialized) {
			console.log("[EmbedService] Embedding service already initialized");
			return;
		}

		console.log("[EmbedService] Initializing embedding model", {
			model: RAG_CONFIG.EMBEDDING.MODEL_NAME
		});

		const startTime = Date.now();

		try {
			this.embedder = await pipeline("feature-extraction", RAG_CONFIG.EMBEDDING.MODEL_NAME, {
				quantized: RAG_CONFIG.EMBEDDING.QUANTIZED
			});

			this.initialized = true;

			const duration = Date.now() - startTime;
			console.log("[EmbedService] Embedding model initialized successfully", {
				durationMs: duration
			});
		} catch (error) {
			console.error("[EmbedService] Failed to initialize embedding model", error);
			throw new Error("Embedding model initialization failed");
		}
	}

	/**
	 * Check if service is initialized
	 */
	isInitialized(): boolean {
		return this.initialized;
	}

	/**
	 * Generate embedding for a single text
	 */
	async generateEmbedding(text: string): Promise<number[]> {
		if (!this.initialized) {
			await this.initialize();
		}

		if (!text || text.trim().length === 0) {
			throw new Error("Cannot generate embedding for empty text");
		}

		try {
			console.log("[EmbedService] Generating embedding", { textLength: text.length });

			const output = await this.embedder(text, {
				pooling: RAG_CONFIG.EMBEDDING.POOLING,
				normalize: RAG_CONFIG.EMBEDDING.NORMALIZE
			});

			return Array.from(output.data);
		} catch (error) {
			console.error("[EmbedService] Embedding generation failed", error, {
				textLength: text.length
			});
			throw new Error("Failed to generate embedding");
		}
	}

	/**
	 * Generate embeddings for multiple texts
	 * Processes texts one at a time (not batched in model, but sequential)
	 */
	async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
		if (!this.initialized) {
			await this.initialize();
		}

		if (texts.length === 0) {
			console.log("[EmbedService] Empty texts array provided for batch embedding");
			return [];
		}

		console.log("[EmbedService] Generating batch embeddings", { count: texts.length });
		const startTime = Date.now();

		const embeddings: number[][] = [];

		for (let i = 0; i < texts.length; i++) {
			const text = texts[i];

			if (!text || text.trim().length === 0) {
				console.log("[EmbedService] Skipping empty text in batch", { index: i });
				continue;
			}

			try {
				const embedding = await this.generateEmbedding(text);
				embeddings.push(embedding);

				if ((i + 1) % 10 === 0) {
					console.log("[EmbedService] Batch progress", {
						processed: i + 1,
						total: texts.length
					});
				}
			} catch (error) {
				console.error("[EmbedService] Failed to generate embedding in batch", error, {
					index: i
				});
				throw error;
			}
		}

		const duration = Date.now() - startTime;
		console.log("[EmbedService] Batch embeddings generated", {
			count: embeddings.length,
			durationMs: duration
		});

		return embeddings;
	}

	/**
	 * Cleanup resources
	 */
	async cleanup(): Promise<void> {
		if (this.embedder?.model) {
			try {
				await this.embedder.model.dispose();
				console.log("[EmbedService] Embedding model resources cleaned up");
			} catch (error) {
				console.log("[EmbedService] Error during embedding model cleanup", { error });
			}
		}
		this.initialized = false;
		this.embedder = null;
	}
}

export const embeddingService = new EmbeddingService();
