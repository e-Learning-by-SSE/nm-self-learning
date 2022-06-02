import { database } from "@self-learning/database";
import { CourseChapter, CourseCompletion } from "@self-learning/types";

export async function getCourseCompletionOfStudent(
	courseSlug: string,
	username: string
): Promise<CourseCompletion> {
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
		},
		orderBy: { createdAt: "asc" },
		distinct: ["lessonId"]
	});

	const lessonIdMap: CourseCompletion["completedLessons"] = {};

	for (const lesson of completedLessons) {
		lessonIdMap[lesson.lessonId] = {
			createdAt: lesson.createdAt,
			slug: lesson.lesson.slug,
			title: lesson.lesson.title
		};
	}

	const contentWithCompletion: CourseCompletion["chapters"] = content.map(chapter => {
		let completed = 0;
		for (const lesson of chapter.lessons) {
			if (lesson.lessonId in lessonIdMap) {
				completed++;
			}
		}

		return {
			chapterTitle: chapter.title,
			completedLessonsCount: completed,
			completedLessonsPercentage:
				chapter.lessons.length > 0 ? (completed / chapter.lessons.length) * 100 : 100
		};
	});

	const completedLessonsCount = Object.keys(lessonIdMap).length;
	const totalLessonsCount = content.reduce(
		(count, chapter) => (count += chapter.lessons.length),
		0
	);

	const completion: CourseCompletion = {
		courseCompletionPercentage:
			totalLessonsCount > 0 ? (completedLessonsCount / totalLessonsCount) * 100 : 100,
		chapters: contentWithCompletion,
		completedLessons: lessonIdMap
	};

	return completion;
}
