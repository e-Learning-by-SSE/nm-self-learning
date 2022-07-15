import { database } from "@self-learning/database";
import {
	Completion,
	CourseCompletion,
	CourseContent,
	extractLessonIds
} from "@self-learning/types";

export type CompletionMap = { [chapterId: string]: Completion };
type CompletedLessonsMap = { [lessonId: string]: { createdAt: Date; slug: string; title: string } };

export type CourseCompletionX = {
	completion: CompletionMap;
	completedLessons: CompletedLessonsMap;
};

export async function getCourseCompletionOfStudent(
	courseSlug: string,
	username: string
): Promise<CourseCompletionX> {
	const course = await database.course.findUniqueOrThrow({
		where: { slug: courseSlug }
	});

	const content = course.content as CourseContent;
	const lessonIds = extractLessonIds(content);

	const completedLessons = await database.completedLesson.findMany({
		select: {
			lessonId: true,
			createdAt: true,
			lesson: { select: { title: true, slug: true } }
		},
		where: {
			AND: {
				username,
				lessonId: { in: lessonIds }
			}
		},
		orderBy: { createdAt: "asc" },
		distinct: ["lessonId"]
	});

	const completedLessonsMap: CompletedLessonsMap = {};

	for (const lesson of completedLessons) {
		completedLessonsMap[lesson.lessonId] = {
			createdAt: lesson.createdAt,
			slug: lesson.lesson.slug,
			title: lesson.lesson.title
		};
	}

	return {
		completion: mapToCourseCompletionFlat(content, completedLessonsMap),
		completedLessons: completedLessonsMap
	};
}

/**
 * Recursively aggregates information about course and chapter completion.
 */
export function mapToCourseCompletion(
	content: CourseContent,
	completedLessonsMap: { [lessonId: string]: unknown }
): CourseCompletion {
	const completion: CourseCompletion = {
		completion: {
			lessonCount: 0,
			completedLessonCount: 0,
			completionPercentage: 0
		},
		content: []
	};

	for (const chapterOrLesson of content) {
		if (chapterOrLesson.type === "chapter") {
			const innerCompletion = mapToCourseCompletion(
				chapterOrLesson.content,
				completedLessonsMap
			);

			completion.completion.completedLessonCount +=
				innerCompletion.completion.completedLessonCount;
			completion.completion.lessonCount += innerCompletion.completion.lessonCount;

			completion.content.push({
				...chapterOrLesson,
				...innerCompletion
			});
		}

		if (chapterOrLesson.type === "lesson") {
			completion.completion.lessonCount++;
			const isCompleted = chapterOrLesson.lessonId in completedLessonsMap;

			if (isCompleted) {
				completion.completion.completedLessonCount++;
			}

			completion.content.push({ ...chapterOrLesson, isCompleted });
		}
	}

	completion.completion.completionPercentage = Math.floor(
		(completion.completion.completedLessonCount / completion.completion.lessonCount) * 100
	);

	return completion;
}

/**
 * Recursively aggregates information about course and chapter completion and stores a {@link Completion} entry for each (sub)chapter.
 */
export function mapToCourseCompletionFlat(
	content: CourseContent,
	completedLessonsMap: { [lessonId: string]: unknown },
	completionMap: CompletionMap = {},
	chapterNr = "course"
): CompletionMap {
	const completion: Completion = {
		lessonCount: 0,
		completedLessonCount: 0,
		completionPercentage: 0
	};

	for (const chapterOrLesson of content) {
		if (chapterOrLesson.type === "chapter") {
			const innerCompletion = mapToCourseCompletionFlat(
				chapterOrLesson.content,
				completedLessonsMap,
				completionMap,
				chapterOrLesson.chapterNr
			);

			completion.completedLessonCount +=
				innerCompletion[chapterOrLesson.chapterNr].completedLessonCount;
			completion.lessonCount += innerCompletion[chapterOrLesson.chapterNr].lessonCount;
		} else {
			completion.lessonCount++;

			if (chapterOrLesson.lessonId in completedLessonsMap) {
				completion.completedLessonCount++;
			}
		}
	}

	completion.completionPercentage = Math.floor(
		(completion.completedLessonCount / completion.lessonCount) * 100
	);

	completionMap[chapterNr] = completion;

	return completionMap;
}
