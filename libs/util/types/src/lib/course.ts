import type { EnrollmentStatus } from "@prisma/client";

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

export type CourseEnrollment = {
	completedAt: Date | null;
	status: EnrollmentStatus;
	course: {
		title: string;
		slug: string;
	};
};

export type CourseChapter = {
	title: string;
	description?: string | null;
	content: CourseLesson[];
};

export type CourseLesson = {
	lessonId: string;
};

export type CourseContent = CourseChapter[];

export function extractLessonIds(content: CourseContent): string[] {
	return content.flatMap(chapter => chapter.content.map(lesson => lesson.lessonId));
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

/** Sets `chapterNr` and `lessonNr` for each chapter/lesson. */
export function createCourseContent(content: CourseContent): CourseContent {
	return content;
}
