import { readFileSync } from 'fs';
import { join } from 'path';
import slugify from 'slugify';

import { faker } from '@faker-js/faker';
import { Prisma, PrismaClient } from '@prisma/client';
import { QuestionType, QuizContent } from '@self-learning/question-types';
import {
    createCourseContent,
    createCourseMeta,
    createLessonMeta,
    extractLessonIds,
    LessonContent,
    LessonContentType,
} from '@self-learning/types';

export function createLesson(
	title: string,
	subtitle: string | null,
	description: string | null,
	content: LessonContent,
	questions: QuizContent
) {
	const lesson: Prisma.LessonCreateInput = {
		title,
		lessonId: faker.random.alphaNumeric(8),
		slug: slugify(title, { lower: true, strict: true }),
		subtitle: subtitle,
		description: description,
		content: content,
		quiz: questions,
		meta: {}
	};

	lesson.meta = createLessonMeta(lesson as any) as unknown as Prisma.JsonObject;

	return lesson;
}

type Lessons = {
	title: string;
	description: string;
	content: Prisma.LessonCreateInput[];
}[];

export function createAuthor(
	name: string,
	imgUrl: string,
	lessons: Lessons,
	courses: Prisma.CourseCreateManyInput[]
): Prisma.UserCreateInput {
	const slug = slugify(name, { lower: true, strict: true });
	return {
		name: name,
		accounts: {
			create: [
				{
					provider: "demo",
					providerAccountId: slug,
					type: "demo-account"
				}
			]
		},
		author: {
			create: {
				displayName: name,
				slug: slug,
				imgUrl: imgUrl,
				courses: {
					connect: courses.map(course => ({ courseId: course.courseId }))
				},
				lessons: {
					connect: extractLessonIds(lessons).map(lessonId => ({ lessonId }))
				},
				teams: {
					create: []
				}
			}
		}
	};
}

type Chapters = {
	title: string;
	description: string;
	content: Prisma.LessonCreateInput[];
}[];

export function createCourse(
	subjectId: number,
	title: string,
	subtitle: string,
	description: string | null,
	imgUrl: string | null,
	chapters: Chapters
): Prisma.CourseCreateManyInput {
	const course = {
		courseId: faker.random.alphaNumeric(8),
		title: title,
		slug: slugify(title, { lower: true, strict: true }),
		subtitle: subtitle,
		description: description,
		imgUrl: imgUrl,
		subjectId: subjectId,
		createdAt: new Date(2022, 4, 20),
		updatedAt: new Date(2022, 5, 1),
		content: createCourseContent(
			chapters.map(chapter => ({
				title: chapter.title,
				description: chapter.description,
				content: chapter.content.map(lesson => ({ lessonId: lesson.lessonId }))
			}))
		),
		meta: {}
	};

	course.meta = createCourseMeta(course);

	return course;
}

type answer = {
	content: string;
	isCorrect: boolean;
};

export function createMultipleChoice(
	question: string,
	answers: answer[],
	hints: string[]
): QuestionType {
	return {
		type: "multiple-choice",
		questionId: faker.random.alphaNumeric(8),
		statement: question,
		withCertainty: false,
		answers: answers.map(answer => ({
			answerId: faker.random.alphaNumeric(8),
			...answer
		})),
		hints: hints.map(h => ({
			hintId: faker.random.alphaNumeric(8),
			content: h
		}))
	};
}

export function createVideo(url: string, duration: number): LessonContentType {
	return {
		type: "video",
		value: {
			url: url
		},
		meta: {
			duration: duration
		}
	};
}

export function createArticle(
	mdContent: string,
	estimatedDuration: number = 300
): LessonContentType {
	return {
		type: "article",
		value: {
			content: mdContent
		},
		meta: {
			estimatedDuration: estimatedDuration
		}
	};
}

export function read(file: string) {
	readFileSync(join(__dirname, file), "utf-8");
}
