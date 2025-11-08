import { ChromaClient } from "chromadb";
import { embeddingService } from "@self-learning/ai-tutor";
import type { DocumentChunk, RetrievalResult } from "@self-learning/types";

class VectorStore {
	private client: ChromaClient | null = null;
	private isInitialized = false;

	async initialize() {
		if (this.isInitialized) return;

		console.log("🔄 Connecting ChromaDB...");

		// Create ChromaDB client (runs in Node.js, no Docker!)
		this.client = new ChromaClient({
			host: "chromadb",
			port: 8000,
			ssl: false
		});

		// Initialize embedding service
		await embeddingService.initialize();

		this.isInitialized = true;
		console.log("✅ ChromaDB initialized!");
	}

	// Create or get collection for a course
	private async getCollection(courseId: string) {
		if (!this.client) throw new Error("VectorStore not initialized");

		const collectionName = `course_${courseId}`;

		try {
			// Try to get existing collection
			return await this.client.getCollection({ name: collectionName });
		} catch {
			// Create new collection if doesn't exist
			return await this.client.createCollection({
				name: collectionName,
				metadata: { description: `Course ${courseId} documents` },
				embeddingFunction: null
			});
		}
	}

	// Add documents to vector store
	async addDocuments(courseId: string, chunks: DocumentChunk[]) {
		await this.initialize();

		console.log(`📝 Adding ${chunks.length} chunks to course ${courseId}...`);

		const collection = await this.getCollection(courseId);

		// Process in batches to avoid memory issues
		const batchSize = 10;
		for (let i = 0; i < chunks.length; i += batchSize) {
			const batch = chunks.slice(i, i + batchSize);

			// Generate embeddings for batch
			const texts = batch.map(chunk => chunk.text);
			const embeddings = await embeddingService.generateBatchEmbeddings(texts);

			// Add to ChromaDB
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

	// Search for relevant documents
	async search(courseId: string, query: string, topK = 5): Promise<RetrievalResult[]> {
		await this.initialize();

		const collection = await this.getCollection(courseId);

		// Generate embedding for query
		const queryEmbedding = await embeddingService.generateEmbedding(query);

		// Search in ChromaDB
		const results = await collection.query({
			queryEmbeddings: [queryEmbedding],
			nResults: topK
		});

		// Format results
		if (!results.documents[0] || !results.metadatas[0] || !results.distances[0]) {
			return [];
		}

		return results.documents[0].map((text, idx) => ({
			text: text || "",
			score: 1 - (results.distances?.[0]?.[idx] ?? 0), // Convert distance to similarity
			metadata: {
				fileName: results.metadatas[0][idx]?.["fileName"] as string,
				chapterName: results.metadatas[0][idx]?.["chapterName"] as string,
				pageNumber: results.metadatas[0][idx]?.["pageNumber"] as number
			}
		}));
	}

	// Delete course collection
	async deleteCourse(courseId: string) {
		await this.initialize();
		const collectionName = `course_${courseId}`;

		try {
			await this.client?.deleteCollection({ name: collectionName });
			console.log(`✅ Deleted course collection: ${courseId}`);
		} catch (error) {
			console.log(`⚠️ Collection ${courseId} not found or already deleted`);
		}
	}

	// Check if course exists
	async courseExists(courseId: string): Promise<boolean> {
		await this.initialize();
		const collectionName = `course_${courseId}`;

		try {
			await this.client?.getCollection({ name: collectionName });
			return true;
		} catch {
			return false;
		}
	}
}

// Export singleton instance
export const vectorStore = new VectorStore();
