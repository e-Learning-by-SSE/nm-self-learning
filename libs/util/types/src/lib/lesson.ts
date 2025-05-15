import { z } from "zod";
import { authorsRelationSchema } from "./author";
import { LessonContent, lessonContentSchema } from "./lesson-content";
import { LessonMeta } from "./lesson-meta";
import { LessonType } from "@prisma/client";
import { skillFormSchema } from "./skill";
import { LessonFormModel } from "@self-learning/teaching";
import { Quiz } from "@self-learning/quiz";

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
	requires: z.array(skillFormSchema),
	provides: z.array(skillFormSchema),
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
		requires: [],
		provides: [],
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

export type LessonWithDraftInfo = LessonOverview & {
	draftId?: string;
	draftOverwritten: boolean;
};

const baseDraftSchema = lessonSchema.partial();

export const lessonDraftSchema = baseDraftSchema.extend({
	id: z.string().optional(),
	slug: z.string().optional(),
	title: z.string().nullable().optional(),
	authors: z.array(z.object({ username: z.string() })),
	owner: z.object({ username: z.string() }),
	license: z.object({}).nullable().optional()
});

export type LessonDraft = z.infer<typeof lessonDraftSchema>;

export type LessonDraftOverview = {
	id: string | undefined;
	lessonId: string | null;
	createdAt: Date;
	title: string | null;
};

export function mapDraftToLessonForm(draft: LessonDraft): LessonFormModel {
	return {
		lessonId: draft.lessonId ?? null,
		slug: draft.slug ?? "",
		title: draft.title ?? "",
		subtitle: draft.subtitle,
		description: draft.description,
		imgUrl: draft.imgUrl,
		authors: Array.isArray(draft.authors) ? draft.authors : [JSON.parse("[]")],
		licenseId: draft.licenseId ?? null,
		requires: Array.isArray(draft.requires) ? draft.requires : [JSON.parse("[]")],
		provides: Array.isArray(draft.provides) ? draft.provides : JSON.parse("[]"),
		content: (draft.content ?? []) as LessonContent,
		quiz: draft.quiz as Quiz,
		lessonType: draft.lessonType ?? "TRADITIONAL",
		selfRegulatedQuestion: draft.selfRegulatedQuestion ?? null
	};
}
