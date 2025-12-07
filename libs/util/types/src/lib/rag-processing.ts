import { z } from "zod";

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
