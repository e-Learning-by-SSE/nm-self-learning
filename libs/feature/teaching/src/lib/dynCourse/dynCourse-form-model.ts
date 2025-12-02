import { authorSchema, authorsRelationSchema, skillFormSchema } from "@self-learning/types";
import { z } from "zod";

export const dynCourseFormSchema = z.object({
	courseId: z.string().nullable(),
	subjectId: z.string().nullable(),
	slug: z.string().min(3),
	title: z.string().min(3),
	subtitle: z.string().min(3),
	description: z.string().nullable(),
	imgUrl: z.string().nullable(),
	teachingGoals: z.array(skillFormSchema),
	requirements: z.array(skillFormSchema),
	authors: authorsRelationSchema
});

export type DynCourseFormModel = z.infer<typeof dynCourseFormSchema>;

export const dynCourseDetailedSchema = z.object({
	courseId: z.string().nullable(),
	subjectId: z.string().nullable(),
	slug: z.string().min(3),
	title: z.string().min(3),
	subtitle: z.string().min(3),
	description: z.string().nullable(),
	imgUrl: z.string().nullable(),
	teachingGoals: z.array(skillFormSchema),
	requirements: z.array(skillFormSchema),
	authors: z.array(authorSchema) // here we have full author data
});

export type DynCourseDetailedModel = z.infer<typeof dynCourseDetailedSchema>;
