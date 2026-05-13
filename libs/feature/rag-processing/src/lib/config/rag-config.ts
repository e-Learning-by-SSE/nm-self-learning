/**
 * RAG System Configuration
 */

export const RAG_CONFIG = {
	/**
	 * Embedding model configuration
	 */
	EMBEDDING: {
		MODEL_NAME: "Xenova/all-MiniLM-L6-v2",
		BATCH_SIZE: 10,
		MAX_RETRIES: 3,
		TIMEOUT_MS: 30000,
		QUANTIZED: true,
		POOLING: "mean" as const,
		NORMALIZE: true
	},

	/**
	 * Vector store configuration
	 */
	VECTOR_STORE: {
		HOST: process.env["CHROMA_HOST"] || "localhost",
		PORT: Number(process.env["CHROMA_PORT"]) || 8000,
		USE_SSL: false,
		MAX_FAILURES: 3,
		COLLECTION_PREFIX: "lesson_"
	},

	/**
	 * Content retrieval configuration
	 */
	RETRIEVAL: { DEFAULT_TOP_K: 3, MAX_TOP_K: 20, MIN_SIMILARITY_SCORE: 0.3 },

	/**
	 * Text chunking configuration
	 */
	CHUNKING: {
		DEFAULT_SIZE: 1000,
		DEFAULT_OVERLAP: 200,
		MIN_CHUNK_SIZE: 100,
		SPLIT_ON_SENTENCES: true
	},

	/**
	 * PDF download and processing configuration
	 */
	DOWNLOAD: {
		MAX_RETRIES: 3,
		TIMEOUT_MS: 30000,
		MAX_FILE_SIZE_MB: 50,
		USER_AGENT: "Mozilla/5.0 (compatible; SelfLearnBot/1.0)",
		PARALLEL_DOWNLOADS: true
	}
} as const;

export type RagConfig = typeof RAG_CONFIG;
