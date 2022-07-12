import type { EnrollmentStatus } from "@prisma/client";

export type CourseCompletion = {
	courseCompletionPercentage: number;
	chapters: {
		title: string;
		completedLessonsCount: number;
		completedLessonsPercentage: number;
	}[];
	completedLessons: {
		[lessonId: string]: {
			createdAt: Date;
			title: string;
			slug: string;
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

export type CourseChapter = {
	type: "chapter";
	title: string;
	description: string | null;
	content: CourseContent;
};

type Lesson = {
	type: "lesson";
	lessonId: string;
};

export type CourseContent = (CourseChapter | Lesson)[];

export function extractLessonIds(content: CourseContent): string[] {
	const lessonIds: string[] = [];

	for (const chapterOrLesson of content) {
		if (chapterOrLesson.type === "chapter") {
			lessonIds.push(...extractLessonIds(chapterOrLesson.content));
		} else {
			lessonIds.push(chapterOrLesson.lessonId);
		}
	}

	return lessonIds;
}

/** Creates an object with the shape of a {@link CourseChapter}.*/
export function createChapter(
	title: string,
	content: CourseContent,
	description?: string
): CourseChapter {
	return {
		type: "chapter",
		title,
		description: description ?? null,
		content
	};
}

/** Creates an object with the shape of a {@link Lesson}. */
export function createLesson(lessonId: string): Lesson {
	return {
		type: "lesson",
		lessonId
	};
}

/**
 * Traverses a {@link CourseContent} array and executes the given callback `fn` for every chapter or lesson.
 *
 * @example
 * let lessonCount = 0;
 * let chapterCount = 0;
 * traverseCourseContent(content, lessonOrChapter => {
 * 	if (lessonOrChapter.type === "chapter") chapterCount++;
 * 	else if (lessonOrChapter.type === "lesson") lessonCount++;
 * });
 */
export function traverseCourseContent<
	T extends ({ type: "chapter"; content: Array<unknown> } | { type: "lesson" })[] // T only extends necessary types; allows custom attributes
>(content: T, fn: (chapterOrLesson: T[0]) => void) {
	content.forEach(item => {
		if (item.type === "chapter") {
			fn(item);
			traverseCourseContent(item.content as T, fn);
		} else {
			fn(item);
		}
	});
}
