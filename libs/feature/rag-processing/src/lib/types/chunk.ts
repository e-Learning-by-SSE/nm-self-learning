interface BaseChunkMetadata {
	lessonId: string;
	lessonName: string;
	chunkIndex: number;
}

interface PDFChunkMetadata extends BaseChunkMetadata {
	pageNumber: number;
	sourceType: "pdf";
}

interface ArticleChunkMetadata extends BaseChunkMetadata {
	articleIndex: number;
	sourceType: "article";
}

interface VideoChunkMetadata extends BaseChunkMetadata {
	videoIndex: number;
	sourceType: "video";
}

type ChunkMetadata = PDFChunkMetadata | ArticleChunkMetadata | VideoChunkMetadata;

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
	metadata: {
		lessonName?: string;
		pageNumber?: number;
		sourceType?: "pdf" | "article" | "video";
	};
}

/**
 * Results of RAG Worker Retrieval for AI-Tutor
 */
export interface RagRetrievalResult {
	context: string;
	sources: {
		lessonName?: string;
		pageNumber?: number;
		sourceType?: "pdf" | "article" | "video";
		score?: number;
	}[];
}

/**
 * Circuit breaker state
 */
export interface CircuitBreakerState {
	failureCount: number;
	isOpen: boolean;
	lastFailure?: Date;
}

/** Valid source types for RAG results */
export const VALID_SOURCE_TYPES = ["pdf", "article", "video"] as const;
export type SourceType = (typeof VALID_SOURCE_TYPES)[number];
