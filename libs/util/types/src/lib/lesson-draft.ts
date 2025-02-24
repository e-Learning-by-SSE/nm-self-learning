import { z } from "zod";
import { LessonType } from "@prisma/client";
import { skillFormSchema } from "./skill";
import { lessonContentSchema } from "./lesson-content";

export const lessonDraftSchema = z.object({
	id: z.string().optional(), // automatically created by prisma (cuid)
	lessonId: z.string().nullable().optional(),
	slug: z.string().min(3).optional(),
	title: z.string().min(3).nullable().optional(),
	subtitle: z.string().nullable().optional(),
	description: z.string().nullable().optional(),
	imgUrl: z.string().nullable().optional(),
	content: z.array(lessonContentSchema).nullable().optional(),
	authors: z.array(z.object({ username: z.string() })),
	owner: z.object({ username: z.string() }),
	license: z.object({}).nullable().optional(),
	licenseId: z.number().nullable().optional(),
	teachingGoals: z.array(skillFormSchema).nullable().optional(),
	requirements: z.array(skillFormSchema).nullable().optional(),
	lessonType: z.nativeEnum(LessonType).optional().default(LessonType.TRADITIONAL),
	selfRegulatedQuestion: z.string().nullable().optional(),
	quiz: z
		.object({
			questions: z.array(z.any()),
			config: z.any().nullable()
		})
		.nullable()
		.optional(),
	updatedAt: z.date().optional(),
	createdAt: z.date().optional()
});

export type LessonDraft = z.infer<typeof lessonDraftSchema>;

export type LessonDraftOverview = {
	id: string;
	lessonId: string | null;
	createdAt: Date;
	title: string | null;
};
