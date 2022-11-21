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

faker.seed(2);
const prisma = new PrismaClient();

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
	subtitle: string | null,
	description: string | null,
	imgUrl: string | null,
	chapters: Chapters
): Prisma.CourseCreateManyInput {
	const course = {
		courseId: faker.random.alphaNumeric(8),
		title: title,
		slug: slugify(title, { lower: true, strict: true }),
		subtitle: subtitle ?? "",
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
	hints?: string[]
): QuestionType {
	const hintsData =
		hints?.map(h => ({
			hintId: faker.random.alphaNumeric(8),
			content: h
		})) ?? [];

	return {
		type: "multiple-choice",
		questionId: faker.random.alphaNumeric(8),
		statement: question,
		withCertainty: false,
		answers: answers.map(answer => ({
			answerId: faker.random.alphaNumeric(8),
			...answer
		})),
		hints: hintsData
	};
}

export function createTextQuestion(
	question: string,
	answers: string[],
	hints?: string[]
): QuestionType {
	const hintsData =
		hints?.map(h => ({
			hintId: faker.random.alphaNumeric(8),
			content: h
		})) ?? [];

	return {
		type: "short-text",
		questionId: faker.random.alphaNumeric(8),
		statement: question,
		withCertainty: false,
		acceptedAnswers: answers.map(answer => ({
			acceptedAnswerId: faker.random.alphaNumeric(8),
			value: answer
		})),
		hints: hintsData
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

export function createSpecialization(
	subjectId: number,
	specializationId: number,
	title: string,
	subtitle: string,
	imgUrlBanner: string | null,
	cardImgUrl: string | null
): Prisma.SpecializationCreateManyInput {
	return {
		specializationId: specializationId,
		subjectId: subjectId,
		slug: slugify(subjectId + "-" + title, {
			lower: true,
			strict: true
		}),
		title: title,
		subtitle: subtitle,
		cardImgUrl: cardImgUrl,
		imgUrlBanner: imgUrlBanner
	};
}

export function read(file: string) {
	return readFileSync(join(__dirname, file), "utf-8");
}

export async function seedCaseStudy(
	name: string,
	courses: Prisma.CourseCreateManyInput[],
	chapters: Chapters,
	authors: Prisma.UserCreateInput[] | null
): Promise<void> {
	console.log("\x1b[94m%s\x1b[0m", name + " Example");

	await prisma.course.createMany({ data: courses });
	console.log(" - %s\x1b[32m ✔\x1b[0m", "Courses");
	await prisma.lesson.createMany({
		data: chapters.flatMap(chapter => chapter.content.map(lesson => lesson))
	});
	console.log(" - %s\x1b[32m ✔\x1b[0m", "Lessons");

	for (const course of courses) {
		const subjectId = course.subjectId;
		if (subjectId) {
			await prisma.specialization.update({
				where: { specializationId: subjectId },
				data: {
					courses: {
						connect: courses.map(course => ({ courseId: course.courseId }))
					}
				}
			});
		}
		console.log(" - %s\x1b[32m ✔\x1b[0m", "Connect Specialization to Course");
	}

	if (authors) {
		for (const author of authors) {
			await prisma.user.create({ data: author });
		}
		console.log(" - %s\x1b[32m ✔\x1b[0m", "Authors");
	}

	console.log("\x1b[94m%s\x1b[32m ✔\x1b[0m", name + " Example");
}
