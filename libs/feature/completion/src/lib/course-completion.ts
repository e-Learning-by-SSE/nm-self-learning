import { database } from "@self-learning/database";
import {
	Completion,
	CourseCompletion,
	CourseContent,
	extractLessonIds
} from "@self-learning/types";

export async function getCourseCompletionOfStudent(
	courseSlug: string,
	username: string
): Promise<CourseCompletion> {
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

	const lessonIdMap: { [lessonId: string]: { createdAt: Date; slug: string; title: string } } =
		{};

	for (const lesson of completedLessons) {
		lessonIdMap[lesson.lessonId] = {
			createdAt: lesson.createdAt,
			slug: lesson.lesson.slug,
			title: lesson.lesson.title
		};
	}

	return mapToCourseCompletion(content, lessonIdMap);
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
 * Recursively aggregates information about course and chapter completion.
 */
export function mapToCourseCompletionFlat(
	content: CourseContent,
	completedLessonsMap: { [lessonId: string]: unknown },
	completionMap: Map<string, Completion> = new Map(),
	chapterNr = "course"
): Map<string, Completion> {
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

			completion.completedLessonCount += innerCompletion.get(
				chapterOrLesson.chapterNr
			)!.completedLessonCount;
			completion.lessonCount += innerCompletion.get(chapterOrLesson.chapterNr)!.lessonCount;
		}

		if (chapterOrLesson.type === "lesson") {
			completion.lessonCount++;
			const isCompleted = chapterOrLesson.lessonId in completedLessonsMap;

			if (isCompleted) {
				completion.completedLessonCount++;
			}
		}
	}

	completion.completionPercentage = Math.floor(
		(completion.completedLessonCount / completion.lessonCount) * 100
	);

	completionMap.set(chapterNr, completion);

	return completionMap;
}
