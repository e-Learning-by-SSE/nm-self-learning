import type { DocumentChunk } from "@self-learning/types";
import { PDFParse } from "pdf-parse";

class DocumentProcessor {
	// Extract text from PDF buffer
	async extractTextFromPDF(buffer: Uint8Array, fileName: string): Promise<string> {
		try {
			const parser = new PDFParse(buffer);
			const data = await parser.getText();
			return data.text;
		} catch (error) {
			console.error(`❌ Failed to extract text from ${fileName}:`, error);
			throw new Error(`PDF extraction failed for ${fileName}`);
		}
	}

	// Split text into chunks with overlap
	private chunkText(text: string, chunkSize = 1000, overlap = 200): string[] {
		const chunks: string[] = [];
		let startIndex = 0;

		while (startIndex < text.length) {
			const endIndex = Math.min(startIndex + chunkSize, text.length);
			const chunk = text.slice(startIndex, endIndex);
			chunks.push(chunk.trim());

			// Move to next chunk with overlap
			startIndex += chunkSize - overlap;
		}

		return chunks;
	}

	// Process a single PDF file
	async processPDF(
		buffer: Uint8Array,
		fileName: string,
		courseId: string,
		courseName: string,
		chapterName?: string
	): Promise<DocumentChunk[]> {
		console.log(`📄 Processing: ${fileName}`);

		// Extract text
		const fullText = await this.extractTextFromPDF(buffer, fileName);

		// Split into chunks
		const textChunks = this.chunkText(fullText, 1000, 200);

		// Create DocumentChunk objects
		const chunks: DocumentChunk[] = textChunks.map((text, index) => ({
			id: `${courseId}_${fileName}_chunk_${index}`,
			text,
			metadata: {
				courseId,
				courseName,
				fileName,
				chapterName: chapterName || fileName.replace(".pdf", ""),
				pageNumber: Math.floor(index / 2) + 1, // Rough estimation
				chunkIndex: index
			}
		}));

		console.log(`✅ Created ${chunks.length} chunks from ${fileName}`);
		return chunks;
	}

	// Process multiple PDF files
	async processMultiplePDFs(
		files: Array<{ buffer: Uint8Array; fileName: string; chapterName?: string }>,
		courseId: string,
		courseName: string
	): Promise<DocumentChunk[]> {
		const allChunks: DocumentChunk[] = [];

		for (const file of files) {
			const chunks = await this.processPDF(
				file.buffer,
				file.fileName,
				courseId,
				courseName,
				file.chapterName
			);
			allChunks.push(...chunks);
		}

		console.log(`✅ Total chunks created: ${allChunks.length}`);
		return allChunks;
	}
}

// Export singleton instance
export const documentProcessor = new DocumentProcessor();
