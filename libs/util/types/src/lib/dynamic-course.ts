import { authorsRelationSchema, authorsSchema, skillFormSchema } from "@self-learning/types";
import { z } from "zod";

export const dynCourseBasicInfoSchema = z.object({
	courseId: z.string().nullable(), // todo: is it ok that id can be null?
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

export type DynCourseBasicInfoModel = z.infer<typeof dynCourseBasicInfoSchema>;

/*
export const generatedLessonPathSchema = z.object({
	lessonPathId: z.string(),
	courseId: z.string()
	//content: z.object(json)
});

export type GeneratedLessonPathModel = z.infer<typeof generatedLessonPathSchema>;

export const dynCourseGenPathFormSchemaOld = z.object({
	courseId: z.string().nullable(),
	subjectId: z.string().nullable(),
	slug: z.string().min(3),
	title: z.string().min(3),
	subtitle: z.string().min(3),
	description: z.string().nullable(),
	imgUrl: z.string().nullable(),
	teachingGoals: z.array(skillFormSchema),
	requirements: z.array(skillFormSchema),
	authors: z.array(authorsSchema),
	//createdAt: z.date(),
	//updatedAt: z.date(),
	//generatedLessonPaths: z.array(generatedLessonPathSchema).optional(),
	courseVersion: z.string()
});

export const dynCourseGenPathFormSchema = z.object({
	courseId: z.string(),
	subjectId: z.string().nullable(),
	slug: z.string(),
	title: z.string(),
	subtitle: z.string(),
	description: z.string().nullable(),
	imgUrl: z.string().nullable(),
	authors: z.array(
		z.object({
			username: z.string(),
			displayName: z.string(),
			imgUrl: z.string().nullable(),
			slug: z.string()
		})
	),
	courseVersion: z.string(),
	createdAt: z.date(),
	updatedAt: z.date(),
	generatedLessonPaths: z.array(generatedLessonPathSchema).optional()
});


export type DynCourseGenPathFormModel = z.infer<typeof dynCourseGenPathFormSchema>;
*/
