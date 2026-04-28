import { pipeline, FeatureExtractionPipeline } from "@xenova/transformers";
import { RAG_CONFIG } from "../config/rag-config";
import { IEmbeddingService } from "../types/embedding";

/**
 * Service for generating text embeddings using transformers
 *
 * Uses the Xenova/transformers library with a pre-trained model to generate vector embeddings for text content.
 *
 * The field `embedder` is typed as `FeatureExtractionPipeline | null`, which is exactly what
 * `pipeline("feature-extraction", ...)` returns.
 * Using the library's own type avoids any hand-rolled interface that would drift from the actual
 * implementation and cause assignability errors.
 */
export class EmbeddingService implements IEmbeddingService {
	private embedder: FeatureExtractionPipeline | null = null;
	private initialized = false;

	/**
	 * Initialize the embedding model
	 * Must be called before generating embeddings
	 */
	async initialize(): Promise<void> {
		if (this.initialized) {
			return;
		}
		try {
			this.embedder = await pipeline("feature-extraction", RAG_CONFIG.EMBEDDING.MODEL_NAME, {
				quantized: RAG_CONFIG.EMBEDDING.QUANTIZED
			});

			this.initialized = true;
		} catch (error) {
			console.error("[EmbedService] Failed to initialize embedding model", {
				error: error instanceof Error ? error.message : String(error)
			});
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
	 * Narrow the embedder field and throw if not yet initialized.
	 *
	 * Using a private getter that returns `FeatureExtractionPipeline` (non-null)
	 * is the idiomatic TypeScript alternative to sprinkling non-null assertions
	 * (`this.embedder!`) throughout the class, and avoids repeating the same
	 * null-check guard in every method.
	 */
	private get activeEmbedder(): FeatureExtractionPipeline {
		if (this.embedder === null) {
			throw new Error("[EmbedService] Embedder accessed before initialization");
		}
		return this.embedder;
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
			const output = await this.activeEmbedder(text, {
				pooling: RAG_CONFIG.EMBEDDING.POOLING,
				normalize: RAG_CONFIG.EMBEDDING.NORMALIZE
			});

			return Array.from(output.data);
		} catch (error) {
			console.error("[EmbedService] Embedding generation failed", {
				error: error instanceof Error ? error.message : String(error),
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
			return [];
		}
		const embeddings: number[][] = [];

		for (let i = 0; i < texts.length; i++) {
			const text = texts[i];

			if (!text || text.trim().length === 0) {
				continue;
			}

			try {
				const embedding = await this.generateEmbedding(text);
				embeddings.push(embedding);
			} catch (error) {
				console.error("[EmbedService] Failed to generate embedding in batch", {
					error: error instanceof Error ? error.message : String(error),
					index: i,
					textLength: text.length
				});
				throw error;
			}
		}

		return embeddings;
	}

	/**
	 * Cleanup resources
	 */
	async cleanup(): Promise<void> {
		if (this.embedder?.model) {
			try {
				await this.embedder.model.dispose();
			} catch {
				// Ignore cleanup errors
			}
		}
		this.initialized = false;
		this.embedder = null;
	}
}

export const embeddingService = new EmbeddingService();
