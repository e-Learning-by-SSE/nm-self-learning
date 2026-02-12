export interface EmbeddingConfig {
	modelName: string;
	quantized: boolean;
	pooling: "mean" | "max" | "cls";
	normalize: boolean;
}

export interface EmbeddingResult {
	embedding: number[];
	text: string;
}

export interface BatchEmbeddingResult {
	embeddings: number[][];
	texts: string[];
	duration: number;
}

export interface IEmbeddingService {
	initialize(): Promise<void>;
	generateEmbedding(text: string): Promise<number[]>;
	generateBatchEmbeddings(texts: string[]): Promise<number[][]>;
	isInitialized(): boolean;
}
