import { z } from "zod";

export const subtitleSrcSchema = z.object({
	segments: z.array(
		z.object({
			start: z.number(),
			end: z.number(),
			text: z.string()
		})
	),
	language: z.string()
});

export const subtitleSchema = z.object({
	src: z.string(),
	label: z.string(),
	srcLang: z.string()
});

export type SubtitleSrc = z.infer<typeof subtitleSrcSchema>;
export type Subtitle = z.infer<typeof subtitleSchema>;
