import { authorsRelationSchema, skillFormSchema } from "@self-learning/types";
import { z } from "zod";

export const newCourseFormSchema = z.object({
	courseId: z.string().nullable(),
	subjectId: z.string().nullable(),
	slug: z.string().min(3),
	title: z.string().min(3),
	subtitle: z.string().min(3),
	description: z.string().nullable(),
	imgUrl: z.string().nullable(),
	teachingGoals:  z.array(skillFormSchema),
	authors: authorsRelationSchema,
});

export type NewCourseFormModel = z.infer<typeof newCourseFormSchema>;
