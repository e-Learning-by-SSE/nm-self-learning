import { z } from "zod";

export const specializationSchema = z.object({
	specializationId: z.string(),
	title: z.string().min(3),
	slug: z.string().min(3),
	subtitle: z.string(),
	cardImgUrl: z.string().url().nullable(),
	imgUrlBanner: z.string().url().nullable()
});

export type Specialization = z.infer<typeof specializationSchema>;
