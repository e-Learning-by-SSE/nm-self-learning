/**
 * Configuration for embedding model
 */
export interface EmbeddingConfig {
	modelName: string;
	quantized: boolean;
	pooling: "mean" | "max" | "cls";
	normalize: boolean;
}

/**
 * Result of embedding generation
 */
export interface EmbeddingResult {
	embedding: number[];
	text: string;
}

/**
 * Batch embedding result
 */
export interface BatchEmbeddingResult {
	embeddings: number[][];
	texts: string[];
	duration: number;
}

/**
 * Embedding service interface
 */
export interface IEmbeddingService {
	initialize(): Promise<void>;
	generateEmbedding(text: string): Promise<number[]>;
	generateBatchEmbeddings(texts: string[]): Promise<number[][]>;
	isInitialized(): boolean;
}
