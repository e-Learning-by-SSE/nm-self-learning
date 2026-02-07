import { z } from "zod";

/**
 * Zod schemas for lesson content validation
 */

export const videoSchema = z.object({
	type: z.literal("video"),
	value: z.object({ url: z.string().url() }),
	meta: z.object({ duration: z.number() })
});

export const articleSchema = z.object({
	type: z.literal("article"),
	value: z.object({ content: z.string().min(1) }),
	meta: z.object({ estimatedDuration: z.number() })
});

export const pdfSchema = z.object({
	type: z.literal("pdf"),
	value: z.object({ url: z.string().url() }),
	meta: z.object({ estimatedDuration: z.number() })
});

export const iframeSchema = z.object({
	type: z.literal("iframe"),
	value: z.object({ url: z.string().url() }),
	meta: z.object({ estimatedDuration: z.number() })
});

/**
 * Discriminated union for all lesson content types
 */
export const lessonContentSchema = z.discriminatedUnion("type", [
	videoSchema,
	articleSchema,
	pdfSchema,
	iframeSchema
]);

/**
 * TypeScript types derived from schemas
 */
export type VideoContent = z.infer<typeof videoSchema>;
export type ArticleContent = z.infer<typeof articleSchema>;
export type PDFContent = z.infer<typeof pdfSchema>;
export type IframeContent = z.infer<typeof iframeSchema>;
export type LessonContent = z.infer<typeof lessonContentSchema>;

/**
 * Prepared content ready for processing
 */
export interface PreparedContent {
	pdfBuffers: Array<{ data: string; url: string }>;
	articleTexts: string[];
	transcriptTexts: string[];
}

/**
 * Result of content ingestion
 */
export interface IngestionResult {
	success: boolean;
	chunksCreated: number;
	breakdown: { pdfChunks: number; articleChunks: number; videoChunks: number };
	message: string;
}
