/**
 * Base metadata shared by all chunk types
 */
export interface BaseChunkMetadata {
	lessonId: string;
	lessonName: string;
	chunkIndex: number;
}

/**
 * Metadata specific to PDF document chunks
 */
export interface PDFChunkMetadata extends BaseChunkMetadata {
	pageNumber: number;
	sourceType: "pdf";
}

/**
 * Metadata specific to article chunks
 */
export interface ArticleChunkMetadata extends BaseChunkMetadata {
	articleIndex: number;
	sourceType: "article";
}

/**
 * Metadata specific to video transcript chunks
 */
export interface VideoChunkMetadata extends BaseChunkMetadata {
	videoIndex: number;
	sourceType: "video";
}

/**
 * Union type for all chunk metadata
 */
export type ChunkMetadata = PDFChunkMetadata | ArticleChunkMetadata | VideoChunkMetadata;

/**
 * Base structure for document chunks
 */
export interface DocumentChunk<T extends ChunkMetadata = ChunkMetadata> {
	id: string;
	text: string;
	metadata: T;
}

/**
 * PDF-specific chunk
 */
export type PDFChunk = DocumentChunk<PDFChunkMetadata>;

/**
 * Article-specific chunk
 */
export type ArticleChunk = DocumentChunk<ArticleChunkMetadata>;

/**
 * Video transcript-specific chunk
 */
export type VideoChunk = DocumentChunk<VideoChunkMetadata>;

/**
 * Options for text chunking
 */
export interface ChunkOptions {
	maxChunkSize: number;
	overlap: number;
	splitOnSentences?: boolean;
}

/**
 * Result of retrieval operation
 */
export interface RetrievalResult {
	text: string;
	score: number;
	metadata: { lessonName: string; pageNumber?: number; sourceType?: "pdf" | "article" | "video" };
}
