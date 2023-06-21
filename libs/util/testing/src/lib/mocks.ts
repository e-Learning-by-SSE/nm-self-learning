import { Lesson, Prisma } from "@prisma/client";
import { Quiz } from "@self-learning/quiz";
import {
	CourseContent,
	createCourseMeta,
	createLessonMeta,
	LessonContent
} from "@self-learning/types";

export function createExampleCourse(
	courseId: string,
	content: CourseContent
): Prisma.CourseCreateInput {
	const course: Prisma.CourseCreateInput = {
		courseId,
		slug: courseId,
		title: `The ${courseId} Course`,
		subtitle: `This is a subtitle for ${courseId}.`,
		description: `This is a description for ${courseId}.`,
		imgUrl: null,
		content,
		meta: {}
	};

	course.meta = createCourseMeta(course as any);

	return course;
}

export function createExampleLessonsFromContent(
	content: CourseContent
): Prisma.LessonCreateManyInput[] {
	return content
		.flatMap(chapter => chapter.content)
		.map(lesson => createExampleLesson(lesson.lessonId));
}

export function createExampleLesson(
	lessonId: string,
	overwrites?: Partial<Lesson>
): Prisma.LessonCreateManyInput {
	const lesson: Prisma.LessonCreateManyInput = {
		lessonId: overwrites?.lessonId ?? lessonId,
		slug: overwrites?.slug ?? lessonId,
		title: overwrites?.title ?? "Lesson " + lessonId,
		subtitle: overwrites?.subtitle ?? `This is a subtitle for ${lessonId}.`,
		description: overwrites?.description ?? `This is a description for ${lessonId}.`,
		imgUrl: overwrites?.imgUrl ?? null,
		licenseId: 1,
		content:
			overwrites?.content ??
			([
				{
					type: "video",
					value: {
						url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
					},
					meta: {
						duration: 300
					}
				},
				{
					type: "article",
					value: {
						content: `# Hello World
lorem ipsum dolor sit amet.`
					},
					meta: {
						estimatedDuration: 500
					}
				}
			] as LessonContent),
		quiz:
			overwrites?.quiz ??
			({
				questions: [],
				config: null
			} satisfies Quiz),
		meta: Prisma.JsonNull
	};

	lesson.meta = createLessonMeta(lesson as any);

	return lesson;
}
