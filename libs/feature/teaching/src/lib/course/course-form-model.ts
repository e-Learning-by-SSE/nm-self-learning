import { Prisma } from "@prisma/client";
import { CourseContent, createCourseContent } from "@self-learning/types";
import { getRandomId, stringOrNull } from "@self-learning/util/common";
import { z } from "zod";

const lessonSchema = z.object({
	type: z.literal("lesson"),
	lessonId: z.string(),
	lessonNr: z.number()
});

type FormLesson = z.infer<typeof lessonSchema>;

export interface FormChapter {
	type: "chapter";
	title: string;
	chapterNr: string;
	chapterId: string;
	description?: string | null;
	content: (FormLesson | FormChapter)[];
}

// https://github.com/colinhacks/zod#recursive-types
const chapterOrLessonSchema: z.ZodType<FormLesson | FormChapter> = z.lazy(() =>
	z.discriminatedUnion("type", [
		lessonSchema,
		z.object({
			type: z.literal("chapter"),
			chapterNr: z.string(),
			chapterId: z.string(),
			title: z.string(),
			description: z.string().nullable().optional(),
			content: z.array(chapterOrLessonSchema)
		})
	])
);

export const courseFormSchema = z.object({
	courseId: z.string().nullable(),
	subjectId: z.number().nullable(),
	slug: z.string().min(3),
	title: z.string().min(3),
	subtitle: z.string().min(3),
	description: z.string().nullable(),
	imgUrl: z.string().nullable(),
	content: z.array(chapterOrLessonSchema)
});

export type CourseFormModel = z.infer<typeof courseFormSchema>;

export function mapFromCourseFormToDbSchema(
	course: CourseFormModel,
	courseId: string
): Prisma.CourseCreateInput {
	const { title, slug, subtitle, description, imgUrl, content, subjectId } = course;

	const courseForDb: Prisma.CourseCreateInput = {
		courseId,
		slug,
		title,
		subtitle,
		content: createCourseContent(mapFormContentToCourseContent(content)),
		imgUrl: stringOrNull(imgUrl),
		description: stringOrNull(description),
		subject: subjectId ? { connect: { subjectId } } : undefined
	};

	return courseForDb;
}

function mapFormContentToCourseContent(contentFromForm: CourseFormModel["content"]): CourseContent {
	const content: CourseContent = [];

	for (const chapterOrLesson of contentFromForm) {
		if (chapterOrLesson.type === "chapter") {
			const innerContent = mapFormContentToCourseContent(chapterOrLesson.content);
			content.push({
				type: "chapter",
				content: innerContent,
				title: chapterOrLesson.title,
				description: chapterOrLesson.description ?? null,
				chapterNr: "" // set by createCourseContent
			});
		} else if (chapterOrLesson.type === "lesson") {
			content.push({
				type: "lesson",
				lessonId: chapterOrLesson.lessonId,
				lessonNr: chapterOrLesson.lessonNr
			});
		}
	}

	return content;
}

export function mapCourseContentToFormContent(
	courseContent: CourseContent,
	lessonInfo: Map<string, { lessonId: string; title: string; slug: string }>,
	lessonNrRef = { lessonNr: 1 },
	parentChapter = ""
): CourseFormModel["content"] {
	const content: CourseFormModel["content"] = [];
	let chapterCount = 1;

	for (const chapterOrLesson of courseContent) {
		if (chapterOrLesson.type === "chapter") {
			const chapterNr =
				parentChapter === "" ? `${chapterCount}` : `${parentChapter}.${chapterCount}`;

			chapterCount++;

			const innerContent = mapCourseContentToFormContent(
				chapterOrLesson.content,
				lessonInfo,
				lessonNrRef,
				chapterNr
			);
			content.push({
				type: "chapter",
				content: innerContent,
				title: chapterOrLesson.title,
				description: chapterOrLesson.description ?? null,
				chapterId: getRandomId(),
				chapterNr: chapterNr
			});
		} else if (chapterOrLesson.type === "lesson") {
			content.push({
				type: "lesson",
				lessonId: chapterOrLesson.lessonId,
				lessonNr: lessonNrRef.lessonNr++
			});
		}
	}

	return content;
}
