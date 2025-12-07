import { z } from "zod";

export const videoSchema = z.object({
	type: z.literal("video"),
	value: z.object({
		url: z.string()
	}),
	meta: z.object({
		duration: z.number()
	})
});

export const articleSchema = z.object({
	type: z.literal("article"),
	value: z.object({
		content: z.string()
	}),
	meta: z.object({
		estimatedDuration: z.number()
	})
});

export const pdfSchema = z.object({
	type: z.literal("pdf"),
	value: z.object({
		url: z.string()
	}),
	meta: z.object({
		estimatedDuration: z.number()
	})
});

export const iframeSchema = z.object({
	type: z.literal("iframe"),
	value: z.object({
		url: z.string()
	}),
	meta: z.object({
		estimatedDuration: z.number()
	})
});

export const lessonContentSchema = z.discriminatedUnion("type", [
	videoSchema,
	articleSchema,
	pdfSchema,
	iframeSchema
]);

export interface DocumentChunk {
	id: string;
	text: string;
	metadata: {
		lessonId: string;
		lessonName: string;
		pageNumber?: number;
		chunkIndex: number;
	};
}

export interface ArticleChunk extends DocumentChunk {
	metadata: {
		lessonId: string;
		lessonName: string;
		articleIndex: number;
		chunkIndex: number;
	};
}

export interface VideoTranscriptChunk extends DocumentChunk {
	metadata: {
		lessonId: string;
		lessonName: string;
		videoIndex: number;
		chunkIndex: number;
	};
}

export interface RetrievalResult {
	text: string;
	score: number;
	metadata: {
		lessonName: string;
		pageNumber?: number;
	};
}

export interface EmbeddingResult {
	embedding: number[];
	text: string;
}

export const IngestionInputSchema = z.object({
	lessonId: z.string().cuid(),
	lessonName: z.string().min(1),
	files: z.array(
		z.object({
			url: z.string().min(1)
		})
	)
});

export const EnqueueJobInputSchema = z.object({
	lessonId: z.string().cuid(),
	jobType: z.enum(["embed", "delete"])
});

export const UpdateJobStatusInputSchema = z.object({
	jobId: z.string().uuid(),
	status: z.enum(["queued", "completed", "failed"])
});

export const JobIDInputSchema = z.object({
	jobId: z.string().uuid()
});

export type IngestionInput = z.infer<typeof IngestionInputSchema>;

export interface IngestionResult {
	success: boolean;
	chunksCreated: number;
	message: string;
}
