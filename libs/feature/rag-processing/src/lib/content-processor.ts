import type { DocumentChunk, ArticleChunk, VideoTranscriptChunk } from "./types";
declare const require: any;

class ContentProcessor {
	private PDFParse: any = null;

	private loadPDFParse() {
		if (!this.PDFParse) {
			const module = require("pdf-parse");
			this.PDFParse = module.PDFParse || module.default || module;
			console.log("📦 Loaded PDFParse class");
		}
		return this.PDFParse;
	}

	async extractTextFromPDF(buffer: Uint8Array): Promise<string> {
		try {
			const PDFParse = this.loadPDFParse();
			const parser = new PDFParse(buffer);
			const data = await parser.getText();

			console.log(`✅ Extracted text from PDF: ${data.numpages} pages`);

			return data.text.trim();
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

	async processArticles(
		articles: string[],
		lessonId: string,
		lessonName: string
	): Promise<ArticleChunk[]> {
		const allChunks: ArticleChunk[] = [];

		for (let i = 0; i < articles.length; i++) {
			const article = articles[i];
			const textChunks = this.chunkText(article, 1000, 200);

			const chunks: ArticleChunk[] = textChunks.map((text, index) => ({
				id: `${lessonId}_${lessonName}_article${i}_chunk_${index}`,
				text,
				metadata: {
					lessonId,
					lessonName,
					articleIndex: i,
					chunkIndex: index
				}
			}));

			allChunks.push(...chunks);
		}

		console.log(`✅ Total article chunks created: ${allChunks.length}`);
		return allChunks;
	}

	async processVideoTranscripts(
		transcripts: string[],
		lessonId: string,
		lessonName: string
	): Promise<VideoTranscriptChunk[]> {
		const allChunks: VideoTranscriptChunk[] = [];

		for (let i = 0; i < transcripts.length; i++) {
			const transcript = transcripts[i];
			const textChunks = this.chunkText(transcript, 1000, 200);

			const chunks: VideoTranscriptChunk[] = textChunks.map((text, index) => ({
				id: `${lessonId}_${lessonName}_video${i}_chunk_${index}`,
				text,
				metadata: {
					lessonId,
					lessonName,
					videoIndex: i,
					chunkIndex: index
				}
			}));

			allChunks.push(...chunks);
		}

		console.log(`✅ Total video transcript chunks created: ${allChunks.length}`);
		return allChunks;
	}
}
export const contentProcessor = new ContentProcessor();
