import { Lesson, Prisma } from "@prisma/client";
import { QuizContent } from "@self-learning/question-types";
import {
	CourseContent,
	createCourseMeta,
	createLessonMeta,
	LessonContent
} from "@self-learning/types";
import { getRandomId } from "@self-learning/util/common";

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
			([
				{
					type: "multiple-choice",
					questionId: "question-1",
					statement: "# What is 1 + 1?",
					answers: [
						{ answerId: getRandomId(), isCorrect: true, content: "1" },
						{ answerId: getRandomId(), isCorrect: true, content: "2" },
						{ answerId: getRandomId(), isCorrect: true, content: "3" }
					]
				}
			] as QuizContent),
		meta: Prisma.JsonNull
	};

	lesson.meta = createLessonMeta(lesson as any);

	return lesson;
}
