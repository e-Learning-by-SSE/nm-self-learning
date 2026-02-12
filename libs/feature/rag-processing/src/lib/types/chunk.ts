export interface BaseChunkMetadata {
	lessonId: string;
	lessonName: string;
	chunkIndex: number;
}

export interface PDFChunkMetadata extends BaseChunkMetadata {
	pageNumber: number;
	sourceType: "pdf";
}

export interface ArticleChunkMetadata extends BaseChunkMetadata {
	articleIndex: number;
	sourceType: "article";
}

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

export type PDFChunk = DocumentChunk<PDFChunkMetadata>;

export type ArticleChunk = DocumentChunk<ArticleChunkMetadata>;

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

/**
 * Circuit breaker state
 */
export interface CircuitBreakerState {
	failureCount: number;
	isOpen: boolean;
	lastFailure?: Date;
}
