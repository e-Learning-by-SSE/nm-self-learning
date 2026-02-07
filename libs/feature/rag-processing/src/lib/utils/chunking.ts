import { RAG_CONFIG } from "../config/rag-config";
import { ChunkOptions } from "../types/chunk";

/**
 * Default chunking options
 */
const DEFAULT_OPTIONS: ChunkOptions = {
	maxChunkSize: RAG_CONFIG.CHUNKING.DEFAULT_SIZE,
	overlap: RAG_CONFIG.CHUNKING.DEFAULT_OVERLAP,
	splitOnSentences: RAG_CONFIG.CHUNKING.SPLIT_ON_SENTENCES
};

/**
 * Split text into sentences using regex
 */
function splitIntoSentences(text: string): string[] {
	// Match sentences ending with . ! ? followed by space or end of string
	// Handles common abbreviations like Mr. Mrs. Dr. etc.
	const sentenceRegex = /[^.!?]+[.!?]+(?:\s|$)/g;
	const sentences = text.match(sentenceRegex);

	if (!sentences || sentences.length === 0) {
		return [text];
	}

	return sentences.map(s => s.trim()).filter(s => s.length > 0);
}

/**
 * Chunk text by character count (fallback method)
 */
function chunkByCharacters(text: string, options: ChunkOptions): string[] {
	const chunks: string[] = [];
	let startIndex = 0;

	while (startIndex < text.length) {
		const endIndex = Math.min(startIndex + options.maxChunkSize, text.length);
		const chunk = text.slice(startIndex, endIndex).trim();

		if (chunk.length >= RAG_CONFIG.CHUNKING.MIN_CHUNK_SIZE) {
			chunks.push(chunk);
		}

		startIndex += options.maxChunkSize - options.overlap;
	}

	return chunks;
}

/**
 * Chunk text by sentences (semantic method)
 */
function chunkBySentences(text: string, options: ChunkOptions): string[] {
	const sentences = splitIntoSentences(text);
	const chunks: string[] = [];
	let currentChunk = "";
	let overlapBuffer: string[] = [];

	for (let i = 0; i < sentences.length; i++) {
		const sentence = sentences[i];
		const tentativeChunk = currentChunk + (currentChunk ? " " : "") + sentence;

		// If adding this sentence would exceed max size
		if (tentativeChunk.length > options.maxChunkSize && currentChunk.length > 0) {
			// Save current chunk
			if (currentChunk.length >= RAG_CONFIG.CHUNKING.MIN_CHUNK_SIZE) {
				chunks.push(currentChunk.trim());
			}

			// Start new chunk with overlap
			const overlapText = overlapBuffer.join(" ");
			currentChunk = overlapText + (overlapText ? " " : "") + sentence;
			overlapBuffer = [sentence];
		} else {
			currentChunk = tentativeChunk;
			overlapBuffer.push(sentence);

			// Keep only sentences that fit in overlap window
			let overlapSize = 0;
			const tempBuffer: string[] = [];
			for (let j = overlapBuffer.length - 1; j >= 0; j--) {
				const s = overlapBuffer[j];
				if (overlapSize + s.length <= options.overlap) {
					tempBuffer.unshift(s);
					overlapSize += s.length;
				} else {
					break;
				}
			}
			overlapBuffer = tempBuffer;
		}
	}

	// Add remaining chunk
	if (currentChunk.trim().length >= RAG_CONFIG.CHUNKING.MIN_CHUNK_SIZE) {
		chunks.push(currentChunk.trim());
	}

	return chunks;
}

/**
 * Chunk text into smaller pieces with optional overlap
 *
 * @param text - Text to chunk
 * @param options - Chunking options
 * @returns Array of text chunks
 */
export function chunkText(text: string, options: Partial<ChunkOptions> = {}): string[] {
	const opts: ChunkOptions = { ...DEFAULT_OPTIONS, ...options };

	if (!text || text.trim().length === 0) {
		console.log("[ChunkingUtil] Empty text provided for chunking");
		return [];
	}

	console.log("[ChunkingUtil] Chunking text", {
		textLength: text.length,
		maxChunkSize: opts.maxChunkSize
	});

	const chunks = opts.splitOnSentences
		? chunkBySentences(text, opts)
		: chunkByCharacters(text, opts);

	console.log("[ChunkingUtil] Text chunked successfully", {
		textLength: text.length,
		chunksCreated: chunks.length
	});

	return chunks;
}

/**
 * Estimate number of chunks for given text
 */
export function estimateChunkCount(
	textLength: number,
	options: Partial<ChunkOptions> = {}
): number {
	const opts: ChunkOptions = { ...DEFAULT_OPTIONS, ...options };
	const effectiveChunkSize = opts.maxChunkSize - opts.overlap;
	return Math.ceil(textLength / effectiveChunkSize);
}
