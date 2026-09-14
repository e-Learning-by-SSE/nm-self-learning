import { database } from "@self-learning/database";
import {
	CompletedLessonsMap,
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

	const content = (course.content ?? []) as CourseContent;
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
			slug: lesson.lesson.slug,
			title: lesson.lesson.title,
			dateIso: lesson.createdAt.toISOString()
		};
	}

	return {
		...mapToCourseCompletion(content, completedLessonsMap),
		completedLessons: completedLessonsMap
	};
}

/**
 * Recursively aggregates information about course and chapter completion and stores a {@link Completion} entry for each (sub)chapter.
 */
export function mapToCourseCompletion(
	content: CourseContent,
	completedLessonsMap: CompletedLessonsMap
): {
	chapterCompletion: Completion[];
	courseCompletion: Completion;
} {
	const chapterCompletion: Completion[] = [];

	for (const chapter of content) {
		const completion: Completion = {
			completedLessonCount: 0,
			lessonCount: 0,
			completionPercentage: 0
		};

		for (const lesson of chapter.content) {
			const isCompleted = !!completedLessonsMap[lesson.lessonId];
			completion.completedLessonCount += isCompleted ? 1 : 0;
			completion.lessonCount += 1;
		}

		completion.completionPercentage = Math.floor(
			(completion.completedLessonCount / completion.lessonCount) * 100
		);
		chapterCompletion.push(completion);
	}

	const courseCompletion: Completion = {
		completedLessonCount: 0,
		lessonCount: 0,
		completionPercentage: 0
	};

	for (const chapter of chapterCompletion) {
		courseCompletion.completedLessonCount += chapter.completedLessonCount;
		courseCompletion.lessonCount += chapter.lessonCount;
	}

	courseCompletion.completionPercentage = Math.floor(
		(courseCompletion.completedLessonCount / courseCompletion.lessonCount) * 100
	);

	return {
		chapterCompletion,
		courseCompletion
	};
}
