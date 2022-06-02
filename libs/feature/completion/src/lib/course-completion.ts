import { database } from "@self-learning/database";
import { CourseChapter, CourseCompletion } from "@self-learning/types";

export async function getCourseCompletionOfStudent(courseSlug: string, username: string) {
	const course = await database.course.findUnique({
		where: { slug: courseSlug },
		rejectOnNotFound: true
	});

	const content = course.content as CourseChapter[];

	const lessonIds = content.flatMap(chapter =>
		chapter.lessons.flatMap(lesson => lesson.lessonId)
	);

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
		}
	});

	const lessonIdMap: { [lessonId: string]: CourseCompletion } = {};

	for (const lesson of completedLessons) {
		lessonIdMap[lesson.lessonId] = {
			createdAt: lesson.createdAt,
			lessonId: lesson.lessonId,
			slug: lesson.lesson.slug,
			title: lesson.lesson.title
		};
	}

	return lessonIdMap;
}
