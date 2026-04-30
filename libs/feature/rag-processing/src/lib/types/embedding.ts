export interface IEmbeddingService {
	initialize(): Promise<void>;
	generateEmbedding(text: string): Promise<number[]>;
	generateBatchEmbeddings(texts: string[]): Promise<number[][]>;
	isInitialized(): boolean;
}
