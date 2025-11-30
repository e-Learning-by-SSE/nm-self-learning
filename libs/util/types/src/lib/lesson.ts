import { z } from "zod";
import { authorsRelationSchema } from "./author";
import { lessonContentSchema } from "./lesson-content";
import { LessonMeta } from "./lesson-meta";
import { AccessLevel, LessonType } from "@prisma/client";
import { skillFormSchema } from "./skill";

export type LessonInfo = {
	lessonId: string;
	slug: string;
	title: string;
	meta: LessonMeta;
	lessonType: string;
};

export const lessonSchema = z.object({
	permissions: z
		.object({
			accessLevel: z.nativeEnum(AccessLevel),
			groupId: z.number(),
			groupName: z.string(),
			grantorId: z.number().nullable()
		})
		.array()
		.min(1, "At least one permission is required"),
	lessonId: z.string().nullable(),
	courseId: z.string().nullable(),
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
			questionOrder: z.array(z.string()),
			config: z.any().nullable()
		})
		.nullable()
	// TODO: quizContentSchema causes "Jest failed to parse a file"
});

export type Lesson = z.infer<typeof lessonSchema>;

/** Returns a {@link Lesson} object with empty/null values.  */
export function createEmptyLesson(): Lesson {
	return {
		permissions: [],
		lessonId: null,
		courseId: null,
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
