import { pipeline } from "@xenova/transformers";

class EmbeddingService {
	private embedder: any = null;
	private isInitialized = false;

	async initialize() {
		if (this.isInitialized) return;

		console.log("🔄 Loading embedding model...");

		this.embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", {
			quantized: true
		});

		this.isInitialized = true;
		console.log("✅ Embedding model loaded!");
	}

	async generateEmbedding(text: string): Promise<number[]> {
		if (!this.isInitialized) {
			await this.initialize();
		}

		try {
			const output = await this.embedder(text, {
				pooling: "mean",
				normalize: true
			});

			return Array.from(output.data);
		} catch (error) {
			console.error("❌ Embedding generation failed:", error);
			throw new Error("Failed to generate embedding");
		}
	}

	async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
		if (!this.isInitialized) {
			await this.initialize();
		}
		const embeddings: number[][] = [];

		for (const text of texts) {
			const embedding = await this.generateEmbedding(text);
			embeddings.push(embedding);
		}

		return embeddings;
	}

	async cleanup() {
		if (this.embedder && this.embedder.model) {
			await this.embedder.model.dispose();
			console.log("🧹 Embedding model resources cleaned up.");
		}
		this.isInitialized = false;
	}
}

export const embeddingService = new EmbeddingService();
