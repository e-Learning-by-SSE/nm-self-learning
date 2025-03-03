import { z } from "zod";
import { authorsRelationSchema } from "./author";
import { lessonContentSchema } from "./lesson-content";
import { LessonMeta } from "./lesson-meta";
import { LessonType } from "@prisma/client";
import { skillFormSchema } from "./skill";

export type LessonInfo = {
	lessonId: string;
	slug: string;
	title: string;
	meta: LessonMeta;
	lessonType: string;
};

export const lessonSchema = z.object({
	lessonId: z.string().nullable(),
	slug: z.string().min(3),
	title: z.string().min(3),
	subtitle: z.string().nullable().optional(),
	description: z.string().nullable().optional(),
	imgUrl: z.string().nullable().optional(),
	content: z.array(lessonContentSchema),
	authors: authorsRelationSchema,
	licenseId: z.number().nullable(),
	requirements: z.array(skillFormSchema),
	teachingGoals: z.array(skillFormSchema),
	lessonType: z.nativeEnum(LessonType),
	selfRegulatedQuestion: z.string().nullable(),
	quiz: z
		.object({
			questions: z.array(z.any()),
			config: z.any().nullable()
		})
		.nullable()
	// TODO: quizContentSchema causes "Jest failed to parse a file"
});

export type Lesson = z.infer<typeof lessonSchema>;

/** Returns a {@link Lesson} object with empty/null values.  */
export function createEmptyLesson(): Lesson {
	return {
		lessonId: null,
		slug: "",
		title: "",
		subtitle: null,
		description: null,
		imgUrl: null,
		quiz: null,
		licenseId: null,
		requirements: [],
		teachingGoals: [],
		content: [],
		authors: [],
		lessonType: LessonType.TRADITIONAL,
		selfRegulatedQuestion: null
	};
}

export type LessonOverview = {
	slug: string;
	title: string;
	updatedAt: Date;
	authors: { displayName: string; slug: string; imgUrl: string | null }[];
	lessonId: string;
};

export type LessonWithDraftInfo = {
	title: string;
	lessonId: string;
	updatedAt: Date;
	draftId: string | undefined;
	draftOverwritten: boolean;
};

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
	id: string | undefined;
	lessonId: string | null;
	createdAt: Date;
	title: string | null;
};
