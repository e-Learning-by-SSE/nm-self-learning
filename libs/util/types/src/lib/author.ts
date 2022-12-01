import { z } from "zod";

const subjectAdminSchema = z.object({
	subjectId: z.string()
});

const specializationSchema = z.object({
	specializationId: z.string()
});

export const authorSchema = z.object({
	displayName: z.string().min(3),
	slug: z.string().min(3),
	imgUrl: z.string().url().nullable(),
	subjectAdmin: z.array(subjectAdminSchema),
	specializationAdmin: z.array(specializationSchema)
});

export type Author = z.infer<typeof authorSchema>;
