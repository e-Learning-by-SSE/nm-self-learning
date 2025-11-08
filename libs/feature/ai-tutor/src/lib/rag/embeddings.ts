import { pipeline } from "@xenova/transformers";

class EmbeddingService {
	private embedder: any = null;
	private isInitialized = false;

	async initialize() {
		if (this.isInitialized) return;

		console.log("🔄 Loading embedding model...");

		// Load the model (happens once, then cached)
		this.embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", {
			quantized: true // Smaller model size, faster loading
		});

		this.isInitialized = true;
		console.log("✅ Embedding model loaded!");
	}

	async generateEmbedding(text: string): Promise<number[]> {
		if (!this.isInitialized) {
			await this.initialize();
		}

		try {
			// Generate embedding
			const output = await this.embedder(text, {
				pooling: "mean",
				normalize: true
			});

			// Convert to array
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

		// Generate embeddings for multiple texts
		const embeddings: number[][] = [];

		for (const text of texts) {
			const embedding = await this.generateEmbedding(text);
			embeddings.push(embedding);
		}

		return embeddings;
	}
}

// Export singleton instance
export const embeddingService = new EmbeddingService();
