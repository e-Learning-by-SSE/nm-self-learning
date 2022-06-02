/* eslint-disable indent */
import { Prisma } from "@prisma/client";
import { getCoursesForSync, getLessonsForSync } from "@self-learning/cms-api";
import { database } from "@self-learning/database";
import { mapCourseContent } from "../map-course-content";

export async function synchronizeCourses(getCoursesFn: typeof getCoursesForSync) {
	const { courses } = await getCoursesFn();

	const promises = courses.map(course => {
		console.log(course);
		const mappedContent = course.content
			? course.content
					.map(chapter => {
						if (chapter?.__typename === "ComponentTableOfContentsChapter") {
							return {
								title: chapter.title,
								description: chapter.description,
								lessons:
									chapter.lessons?.map(lesson => ({
										lessonId: lesson?.lesson?.data?.attributes
											?.lessonId as string
									})) ?? []
							};
						}

						return undefined; // TODO
					})
					.filter(Boolean)
			: [];

		console.log(JSON.stringify(mappedContent, null, 4));

		const courseInput: Prisma.CourseCreateInput = {
			...course,
			content: mapCourseContent(mappedContent as any)
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
