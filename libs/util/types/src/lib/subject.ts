import { z } from "zod";

export const subjectSchema = z.object({
	subjectId: z.string(),
	title: z.string().min(3),
	slug: z.string().min(3),
	subtitle: z.string(),
	cardImgUrl: z.string().url().nullable(),
	imgUrlBanner: z.string().url().nullable()
});

export type Subject = z.infer<typeof subjectSchema>;
