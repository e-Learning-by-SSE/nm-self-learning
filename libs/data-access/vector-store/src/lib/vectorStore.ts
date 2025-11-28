import { ChromaClient } from "chromadb";
import { embeddingService } from "@self-learning/ai-tutor";
import type { DocumentChunk, RetrievalResult } from "@self-learning/types";

class VectorStore {
	private client: ChromaClient | null = null;
	private isInitialized = false;

	async initialize() {
		if (this.isInitialized) return;

		console.log("🔄 Connecting ChromaDB...");

		this.client = new ChromaClient({
			host: process.env["CHROMA_HOST"] || "localhost",
			port: Number(process.env["CHROMA_PORT"]) || 8000,
			ssl: false
		});

		await embeddingService.initialize();

		this.isInitialized = true;
		console.log("✅ ChromaDB initialized!");
	}

	private async getCollection(lessonId: string) {
		if (!this.client) throw new Error("VectorStore not initialized");

		const collectionName = `lesson_${lessonId}`;

		try {
			return await this.client.getCollection({ name: collectionName });
		} catch {
			return await this.client.createCollection({
				name: collectionName,
				metadata: { description: `lesson ${lessonId} documents` },
				embeddingFunction: null
			});
		}
	}

	async addDocuments(lessonId: string, chunks: DocumentChunk[]) {
		await this.initialize();
		console.log(`📝 Adding ${chunks.length} chunks to lesson ${lessonId}...`);
		const collection = await this.getCollection(lessonId);

		const batchSize = 10;
		for (let i = 0; i < chunks.length; i += batchSize) {
			const batch = chunks.slice(i, i + batchSize);
			const texts = batch.map(chunk => chunk.text);
			const embeddings = await embeddingService.generateBatchEmbeddings(texts);
			await collection.add({
				ids: batch.map(chunk => chunk.id),
				embeddings: embeddings,
				documents: texts,
				metadatas: batch.map(chunk => chunk.metadata as any)
			});

			console.log(
				`✅ Processed batch ${i / batchSize + 1}/${Math.ceil(chunks.length / batchSize)}`
			);
		}
		console.log("✅ All chunks added successfully!");
	}

	async search(lessonId: string, query: string, topK = 5): Promise<RetrievalResult[]> {
		await this.initialize();
		const collection = await this.getCollection(lessonId);
		const queryEmbedding = await embeddingService.generateEmbedding(query);
		const results = await collection.query({
			queryEmbeddings: [queryEmbedding],
			nResults: topK
		});
		if (!results.documents[0] || !results.metadatas[0] || !results.distances[0]) {
			return [];
		}

		return results.documents[0].map((text, idx) => ({
			text: text || "",
			score: 1 - (results.distances?.[0]?.[idx] ?? 0), // Convert distance to similarity
			metadata: {
				lessonName: results.metadatas[0][idx]?.["lessonName"] as string,
				pageNumber: results.metadatas[0][idx]?.["pageNumber"] as number | undefined
			}
		}));
	}

	async deletelesson(lessonId: string) {
		await this.initialize();
		const collectionName = `lesson_${lessonId}`;

		try {
			await this.client?.deleteCollection({ name: collectionName });
			console.log(`✅ Deleted lesson collection: ${lessonId}`);
		} catch (error) {
			console.log(`⚠️ Collection ${lessonId} not found or already deleted`);
		}
	}

	async lessonExists(lessonId: string): Promise<boolean> {
		await this.initialize();
		const collectionName = `lesson_${lessonId}`;

		try {
			await this.client?.getCollection({ name: collectionName });
			return true;
		} catch {
			return false;
		}
	}
}
export const vectorStore = new VectorStore();
