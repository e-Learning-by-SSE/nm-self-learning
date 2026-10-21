import { LessonType } from "@prisma/client";
import { database } from "@self-learning/database";
import {
	getLessonDuration,
	CourseContent,
	extractLessonIds,
	LessonInfo,
	Summary
} from "@self-learning/types";
import * as ToC from "@self-learning/ui/course";

export function mapToTocContent(
	content: CourseContent,
	lessonIdMap: Map<string, LessonInfo>
): ToC.Content {
	let lessonNr = 1;

	return content.map(chapter => ({
		title: chapter.title,
		description: chapter.description,
		content: chapter.content.map(({ lessonId }) => {
			const lesson: ToC.Content[0]["content"][0] = lessonIdMap.has(lessonId)
				? {
						...(lessonIdMap.get(lessonId) as LessonInfo),
						lessonNr: lessonNr++
					}
				: {
						lessonId: "removed",
						slug: "removed",
						meta: { hasQuiz: false, mediaTypes: {} },
						title: "Removed",
						lessonType: LessonType.TRADITIONAL,
						lessonNr: -1,
						performanceScore: null
					};

			return lesson;
		})
	}));
}

export async function mapCourseContent(content: CourseContent): Promise<ToC.Content> {
	const lessonIds = extractLessonIds(content);

	const lessons = await database.lesson.findMany({
		where: { lessonId: { in: lessonIds } },
		select: {
			lessonId: true,
			slug: true,
			title: true,
			meta: true
		}
	});

	const map = new Map<string, LessonInfo>();

	for (const lesson of lessons) {
		map.set(lesson.lessonId, lesson as LessonInfo);
	}

	return mapToTocContent(content, map);
}

export function createCourseSummary(content: ToC.Content): Summary {
	const chapters = content.length;
	let lessons = 0;
	let duration = 0;

	for (const chapter of content) {
		for (const lesson of chapter.content) {
			lessons++;
			duration += getLessonDuration(lesson.meta);
		}
	}

	return { lessons, chapters, duration };
}
