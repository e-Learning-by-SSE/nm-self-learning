import type { DocumentChunk } from "@self-learning/types";
import pdf from "pdf-parse";

class DocumentProcessor {
	private toBuffer(u8: Uint8Array): Buffer {
  // If the Uint8Array spans the whole underlying ArrayBuffer, this is zero-copy.
  return Buffer.from(u8.buffer, u8.byteOffset, u8.byteLength);
}
    
    async extractTextFromPDF(buffer: Uint8Array): Promise<string> {
		try {
			const data = await pdf(this.toBuffer(buffer));
			return data.text;
		} catch (error) {
			console.error(`❌ Failed to extract text from PDF buffer:`, error);
			throw new Error(`PDF extraction failed for buffer`);
		}
	}

	private chunkText(text: string, chunkSize = 1000, overlap = 200): string[] {
		const chunks: string[] = [];
		let startIndex = 0;

		while (startIndex < text.length) {
			const endIndex = Math.min(startIndex + chunkSize, text.length);
			const chunk = text.slice(startIndex, endIndex);
			chunks.push(chunk.trim());
			startIndex += chunkSize - overlap;
		}

		return chunks;
	}

	async processPDF(
		buffer: Uint8Array,
		lessonId: string,
		lessonName: string
	): Promise<DocumentChunk[]> {
		console.log(`📄 Processing PDF buffer`);
		const fullText = await this.extractTextFromPDF(buffer);
		const textChunks = this.chunkText(fullText, 1000, 200);

		const chunks: DocumentChunk[] = textChunks.map((text, index) => ({
			id: `${lessonId}_${lessonName}_chunk_${index}`,
			text,
			metadata: {
				lessonId,
				lessonName,
				pageNumber: Math.floor(index / 2) + 1,
				chunkIndex: index
			}
		}));
		console.log(`✅ Created ${chunks.length} chunks from PDF buffer`);
		return chunks;
	}

	async processMultiplePDFs(
		files: Array<{ buffer: Uint8Array }>,
		lessonId: string,
		lessonName: string
	): Promise<DocumentChunk[]> {
		const allChunks: DocumentChunk[] = [];

		for (const file of files) {
			const chunks = await this.processPDF(file.buffer, lessonId, lessonName);
			allChunks.push(...chunks);
		}

		console.log(`✅ Total chunks created: ${allChunks.length}`);
		return allChunks;
	}
}
export const documentProcessor = new DocumentProcessor();
