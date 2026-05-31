import { z } from "zod";

export const videoSchema = z.object({
	type: z.literal("video"),
	value: z.object({
		url: z.string(),
		subtitle: z
			.object({
				src: z.string(),
				label: z.string(),
				srcLang: z.string()
			})
			.optional()
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
		url: z.string(),
		// Optional fields for uploaded content (HTML, Zip, H5P)
		// Only present when content was uploaded, not for external URLs
		source: z.enum(["url", "html", "zip", "h5p"]).optional(),
		entryPoint: z.string().optional(),       // e.g. "index.html" for zip
		originalFileName: z.string().optional(), // e.g. "nano-demo.zip" for display
		folderObjectName: z.string().optional()  // MinIO folder prefix for cleanup
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

export const CONTENT_TYPES = lessonContentSchema.options.map(
	schema => schema.shape.type.value
) satisfies readonly string[];

export function getContentTypeDisplayName(contentType: LessonContentMediaType): string {
	const names: { [contentType in LessonContentMediaType]: string } = {
		video: "Video",
		article: "Artikel",
		pdf: "PDF",
		iframe: "Externe Webseite"
	};

	return names[contentType] ?? "Unknown Type";
}

export type Video = z.infer<typeof videoSchema>;
export type Article = z.infer<typeof articleSchema>;
export type PDF = z.infer<typeof pdfSchema>;
export type IFrame = z.infer<typeof iframeSchema>;

export type LessonContentType = z.infer<typeof lessonContentSchema>;
export type LessonContentMediaType = LessonContentType["type"];
export type LessonContent = LessonContentType[];

type InferContentType<
	CType extends LessonContentType["type"],
	Union = LessonContentType
> = Union extends {
	type: CType;
}
	? Union
	: never;

export type ValueByContentType<CType extends LessonContentType["type"]> =
	InferContentType<CType>["value"];

export type MetaByContentType<CType extends LessonContentType["type"]> =
	InferContentType<CType>["meta"];

export function findContentType<CType extends LessonContentType["type"]>(
	type: CType,
	content: LessonContent
): { content: InferContentType<CType> | null; index: number } {
	const index = content.findIndex(c => c.type === type);

	if (index >= 0) {
		return { content: content[index] as InferContentType<CType>, index };
	}

	return { content: null, index };
}

export function includesMediaType(
	types: LessonContentType["type"][],
	type: string
): { isIncluded: boolean; type: LessonContentType["type"] } {
	return {
		isIncluded: types.includes(type as LessonContentType["type"]),
		type: type as LessonContentType["type"]
	};
}
