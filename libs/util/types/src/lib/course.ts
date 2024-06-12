import type { EnrollmentStatus } from "@prisma/client";
import { z } from "zod";

export type Completion = {
	/** Number of lessons in this chapter (includes nested chapters). */
	lessonCount: number;
	/** Number of completed lessons in this chapter (includes nested chapters). */
	completedLessonCount: number;
	completionPercentage: number;
};

export type CompletedLessonsMap = {
	[lessonId: string]: { slug: string; title: string; dateIso: string };
};

export type CourseCompletion = {
	courseCompletion: Completion;
	chapterCompletion: Completion[];
	completedLessons: CompletedLessonsMap;
};

export type EnrollmentDetails = {
	completedAt: string | null;
	status: EnrollmentStatus;
	lastProgressUpdate: string;
	course: {
		title: string;
		slug: string;
		imgUrl: string | null;
		authors: { displayName: string }[];
	};
	completions: {
		courseCompletion: {
			completionPercentage: number;
		};
	};
};

export type CourseEnrollment = {
	completedAt: Date | null;
	status: EnrollmentStatus;
	course: {
		title: string;
		slug: string;
	};
};

export type CourseMeta = {
	lessonCount: number;
};

const lessonSchema = z.object({
	lessonId: z.string()
});

export const chapterSchema = z.object({
	title: z.string(),
	description: z.string().optional().nullish(),
	content: z.array(lessonSchema)
});

export const courseContentSchema = z.array(chapterSchema);

export type CourseChapter = z.infer<typeof chapterSchema>;
export type CourseLesson = z.infer<typeof lessonSchema>;
export type CourseContent = z.infer<typeof courseContentSchema>;

export function extractLessonIds(content: CourseContent): string[] {
	return content.flatMap(chapter => chapter.content.map(lesson => lesson.lessonId));
}

export function createCourseMeta({ content }: { content: CourseContent }): CourseMeta {
	const lessons = extractLessonIds(content as CourseContent);
	return {
		lessonCount: lessons.length
	};
}

/** Creates an object with the shape of a {@link CourseChapter}.*/
export function createChapter(
	title: string,
	content: CourseLesson[],
	description?: string
): CourseChapter {
	return {
		title,
		description,
		content
	};
}

/** Creates an object with the shape of a {@link CourseLesson}. */
export function createLesson(lessonId: string): CourseLesson {
	return {
		lessonId
	};
}

export function createCourseContent(content: CourseContent): CourseContent {
	return content;
}
