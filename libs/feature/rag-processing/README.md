# rag-processing

A comprehensive Retrieval-Augmented Generation (RAG) library for processing, embedding, and searching lesson content.

## Overview

The `rag-processing` library provides services for:

- **Content Processing**: Extract and chunk text from PDFs, articles, and video transcripts
- **Embeddings**: Generate vector embeddings using transformer models
- **Vector Search**: Store and retrieve semantically similar content using ChromaDB
- **RAG Pipeline**: End-to-end workflow for preparing lesson content for AI-powered retrieval

## Features

- ✅ Multi-format content support (PDF, plain text articles, video transcripts)
- ✅ Intelligent text chunking with configurable chunk sizes and overlap
- ✅ Transformer-based embeddings via Xenova/transformers
- ✅ ChromaDB integration for vector storage and retrieval
- ✅ Circuit breaker pattern for fault tolerance
- ✅ Batch processing for efficient embedding generation
- ✅ Similarity-based filtering for search results
- ✅ Comprehensive error handling and logging

## Architecture

### Core Services

#### ContentProcessor

Handles extraction and chunking of various content types:

- **PDF Processing**: Extracts text from PDF buffers using `pdf-parse`
- **Article Processing**: Chunks plain-text articles into semantic units
- **Video Processing**: Processes video transcripts into chunks

Configuration options include chunk size and overlap for flexible chunking strategies.

#### EmbeddingService

Generates vector embeddings for text:

- Lazy-loads the transformer model on first use
- Supports both single and batch embedding generation
- Configurable pooling and normalization strategies
- Resource cleanup with model disposal

Model: `Xenova/bge-small-en-v1.5` (configurable via `RAG_CONFIG`)

#### VectorStore

Manages vector storage and similarity search:

- ChromaDB client integration
- Automatic collection creation per lesson
- Batch embedding and storage with configurable batch sizes
- Similarity-based retrieval with configurable thresholds
- Circuit breaker for handling repeated failures
- Lesson collection existence checking and deletion

### Configuration

Configuration is managed via `src/lib/config/rag-config.ts`:

```typescript
{
  VECTOR_STORE: {
    HOST: "localhost",
    PORT: 8000,
    USE_SSL: false,
    COLLECTION_PREFIX: "lesson_",
    MAX_FAILURES: 3
  },
  EMBEDDING: {
    MODEL_NAME: "Xenova/bge-small-en-v1.5",
    QUANTIZED: true,
    POOLING: "mean",
    NORMALIZE: true,
    BATCH_SIZE: 10
  },
  RETRIEVAL: {
    MIN_SIMILARITY_SCORE: 0.5,
    MAX_TOP_K: 20
  }
}
```

## Usage

### Processing Content

```typescript
import { contentProcessor } from "@self-learning/rag-processing";

// Process PDF
const pdfBuffer = Buffer.from(pdfData);
const pdfChunks = await contentProcessor.processPDF(
	new Uint8Array(pdfBuffer),
	"lesson-123",
	"My Lesson"
);

// Process articles
const articleChunks = await contentProcessor.processArticles(
	["Article 1 text", "Article 2 text"],
	"lesson-123",
	"My Lesson"
);

// Process video transcripts
const videoChunks = await contentProcessor.processVideoTranscripts(
	["Transcript 1", "Transcript 2"],
	"lesson-123",
	"My Lesson"
);
```

### Generating Embeddings

```typescript
import { embeddingService } from "@self-learning/rag-processing";

// Initialize (required before use)
await embeddingService.initialize();

// Single embedding
const embedding = await embeddingService.generateEmbedding("Sample text");

// Batch embeddings
const embeddings = await embeddingService.generateBatchEmbeddings(["Text 1", "Text 2"]);

// Cleanup resources
await embeddingService.cleanup();
```

### Vector Storage & Search

```typescript
import { vectorStore } from "@self-learning/rag-processing";

// Initialize connection to ChromaDB
await vectorStore.initialize(false); // true = skip embedding service init

// Add documents to vector store
await vectorStore.addDocuments("lesson-123", chunks);

// Search for relevant documents
const results = await vectorStore.search("lesson-123", "query text", 5);
// Results: RetrievalResult[] with text, score, and metadata

// Check if lesson exists
const exists = await vectorStore.lessonExists("lesson-123");

// Delete lesson collection
await vectorStore.deleteLesson("lesson-123");

// Cleanup
await vectorStore.cleanup();
```

### End-to-End RAG Preparation

```typescript
import {
	contentProcessor,
	vectorStore,
	prepareRagContent,
	getRagVersionHash
} from "@self-learning/rag-processing";

// Prepare content from various sources
const prepared = await prepareRagContent(lessonContent);

// Generate version hash for change detection
const hash = getRagVersionHash(JSON.stringify(lessonContent));

// Store in vector database
await vectorStore.addDocuments(lessonId, allChunks);
```

## Building

```bash
nx build rag-processing
```

## Running Unit Tests

```bash
nx test rag-processing
```

Runs tests via [Jest](https://jestjs.io) with mocked external dependencies:

- `pdf-parse` for PDF extraction
- `@xenova/transformers` for embeddings
- `chromadb` for vector storage

## Dependencies

### Core

- `@prisma/client` - Database ORM
- `chromadb` - Vector database client

### Processing

- `pdf-parse` - PDF text extraction

### AI/ML

- `@xenova/transformers` - Transformer models for embeddings

### Utilities

- `date-fns` - Date formatting
- `crypto` - UUID generation
- `zod` - Schema validation

## Error Handling

Services implement comprehensive error handling:

- **EmptyTextError**: When attempting embeddings for empty input
- **CircuitBreakerError**: When ChromaDB has repeated failures
- **InitializationError**: When services fail to initialize
- **ProcessingError**: When content extraction or chunking fails

Errors are logged with context (lessonId, textLength, etc.) for debugging.

## Performance Considerations

- **Batch Processing**: Process multiple embeddings simultaneously (configurable batch size)
- **Lazy Loading**: Embedding model loads only on first use
- **Chunking**: Configurable chunk size and overlap for memory efficiency
- **Circuit Breaker**: Prevents cascading failures from repeated ChromaDB timeouts
- **Caching**: Collection metadata cached to reduce lookups

## Resources & Links

- [ChromaDB Documentation](https://docs.trychroma.com/)
- [Hugging Face Transformers](https://huggingface.co/docs/transformers/)
- [Xenova/Transformers.js](https://xenoba.github.io/transformers.js/)
- [BGE Embedding Model](https://huggingface.co/BAAI/bge-small-en-v1.5)
