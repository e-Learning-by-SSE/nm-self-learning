import { Prisma } from "@prisma/client";
import { getCoursesForSync, getLessonsForSync } from "@self-learning/cms-api";
import { database } from "@self-learning/database";

export async function synchronizeCourses(getCoursesFn: typeof getCoursesForSync) {
	const { courses } = await getCoursesFn();

	const promises = courses.map(course => {
		const courseInput: Prisma.CourseCreateInput = {
			...course,
			subtitle: ""
		};

		const promise = database.course.upsert({
			where: { courseId: course.courseId },
			create: courseInput,
			update: courseInput
		});

		return promise;
	});

	await Promise.all(promises);

	return;
}

export async function synchronizeLessons(getLessonsFn: typeof getLessonsForSync) {
	const { lessons } = await getLessonsFn();

	const promises = lessons.map(lesson => {
		const input: Prisma.LessonCreateInput = lesson;

		const promise = database.lesson.upsert({
			where: { lessonId: lesson.lessonId },
			create: input,
			update: input
		});

		return promise;
	});

	await Promise.all(promises);
}
