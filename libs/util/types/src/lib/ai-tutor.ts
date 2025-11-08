import { z } from "zod";
import { TRPC_ERROR_CODE_KEY } from "@trpc/server/dist/rpc";

export const messagesSchema = z.object({
	messages: z.array(
		z.object({
			role: z.string().min(1),
			content: z.string().min(1)
		})
	)
});

export interface Message {
	role: string;
	content: string;
}

export const statusToTRPCError: Record<number, { code: TRPC_ERROR_CODE_KEY; message: string }> = {
	400: { code: "BAD_REQUEST", message: "Invalid request" },
	401: { code: "UNAUTHORIZED", message: "Invalid or missing authorization token" },
	403: { code: "FORBIDDEN", message: "Forbidden" },
	404: { code: "NOT_FOUND", message: "Not found" },
	500: { code: "INTERNAL_SERVER_ERROR", message: "Unexpected server error" },
	502: { code: "INTERNAL_SERVER_ERROR", message: "Bad response from backend server" },
	503: { code: "TIMEOUT", message: "Backend server is unavailable" },
	504: { code: "TIMEOUT", message: "Backend server is taking too long to respond" }
};

export const LOCAL_STORAGE_KEY = "aiTutorCurrentChat";

// Type definitions for RAG system

export interface DocumentChunk {
	id: string;
	text: string;
	metadata: {
		courseId: string;
		courseName: string;
		fileName: string;
		chapterName?: string;
		pageNumber?: number;
		chunkIndex: number;
	};
}

export interface RetrievalResult {
	text: string;
	score: number;
	metadata: {
		fileName: string;
		chapterName?: string;
		pageNumber?: number;
	};
}

export interface EmbeddingResult {
	embedding: number[];
	text: string;
}

export const IngestionInputSchema = z.object({
	courseId: z.string().cuid(),
	courseName: z.string().min(1),
	files: z.array(
		z.object({
			fileName: z.string().min(1),
			url: z.string().min(1)
		})
	)
});

export type IngestionInput = z.infer<typeof IngestionInputSchema>;

export interface IngestionResult {
	success: boolean;
	chunksCreated: number;
	message: string;
}
