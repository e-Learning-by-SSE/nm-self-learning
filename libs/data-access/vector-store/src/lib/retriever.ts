import { vectorStore } from "@self-learning/vector-store";
import { documentProcessor } from "./documentProcessor";
import type { RetrievalResult } from "@self-learning/types";

class RAGRetriever {
	//Download PDF from MinIO URL
	async processPDFFromURL(
		courseId: string,
		courseName: string,
		pdfFiles: Array<{ url: string; fileName: string }>
	) {
		// Download PDFs from MinIO
		const downloadedFiles = await Promise.all(
			pdfFiles.map(async file => {
				const response = await fetch(file.url);

				if (!response.ok) {
					throw new Error(`Failed to download PDF from ${file.url}`);
				}

				const uint8Array = new Uint8Array(await response.arrayBuffer());
				return {
					buffer: uint8Array,
					fileName: file.fileName
				};
			})
		);

		// Ingest downloaded PDFs
		return this.ingestCourse(courseId, courseName, downloadedFiles);
	}

	// Ingest course PDFs (call this when uploading PDFs)
	async ingestCourse(
		courseId: string,
		courseName: string,
		pdfFiles: Array<{ buffer: Uint8Array; fileName: string }>
	) {
		try {
			console.log(`🚀 Starting ingestion for course: ${courseName}`);

			// Check if course already exists
			const exists = await vectorStore.courseExists(courseId);
			if (exists) {
				console.log(`⚠️ Course ${courseId} already exists. Deleting old data...`);
				await vectorStore.deleteCourse(courseId);
			}

			// Process PDFs into chunks
			const chunks = await documentProcessor.processMultiplePDFs(
				pdfFiles,
				courseId,
				courseName
			);

			// Store in vector database
			await vectorStore.addDocuments(courseId, chunks);

			console.log(`✅ Course ${courseName} ingested successfully!`);
			return {
				success: true,
				chunksCreated: chunks.length,
				message: `Successfully ingested ${pdfFiles.length} PDFs`
			};
		} catch (error) {
			console.error("❌ Ingestion failed at retrieval:", error);
			throw error;
		}
	}

	// Retrieve relevant context for a question
	async retrieveContext(
		courseId: string,
		question: string,
		topK = 5
	): Promise<{ context: string; sources: RetrievalResult[] }> {
		try {
			// Check if course exists
			const exists = await vectorStore.courseExists(courseId);
			if (!exists) {
				throw new Error(`Course ${courseId} not found. Please ingest the course first.`);
			}

			// Search for relevant chunks
			const results = await vectorStore.search(courseId, question, topK);

			if (results.length === 0) {
				return {
					context: "No relevant content found.",
					sources: []
				};
			}

			// Format context for LLM
			const context = results
				.map((result, idx) => {
					const source = result.metadata.chapterName || result.metadata.fileName;
					const page = result.metadata.pageNumber
						? ` (Page ${result.metadata.pageNumber})`
						: "";
					return `[Source ${idx + 1}: ${source}${page}]\n${result.text}`;
				})
				.join("\n\n---\n\n");

			return { context, sources: results };
		} catch (error) {
			console.error("❌ Retrieval failed:", error);
			throw error;
		}
	}

	// Delete course data
	async deleteCourse(courseId: string) {
		await vectorStore.deleteCourse(courseId);
	}
}

// Export singleton instance
export const ragRetriever = new RAGRetriever();
