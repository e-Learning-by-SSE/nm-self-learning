import slugify from 'slugify';

import { faker } from '@faker-js/faker';
import { Prisma, PrismaClient } from '@prisma/client';
import { QuizContent } from '@self-learning/question-types';
import {
    createCourseContent,
    createCourseMeta,
    createLessonMeta,
    extractLessonIds,
    LessonContent,
} from '@self-learning/types';

import { createAuthor, createLesson } from './seed-functions';

faker.seed(2);

const prisma = new PrismaClient();

const lessons = [
	{
		title: "Installation",
		description: "Eirichtung einer Arbeitsumgebung zur Entwicklung von Java-Anwendungen",
		content: [
			createLesson(
				"Installation des JDKs",
				null,
				"Download und Installation des JDKs",
				"https://cdn.iconscout.com/icon/free/png-512/java-43-569305.png",
				[],
				[]
			)
		]
	}
];

const courses: Prisma.CourseCreateManyInput[] = [
	{
		courseId: faker.random.alphaNumeric(8),
		title: "Objectorientierte Programmierung mit Java",
		slug: "java-oo",
		subtitle: "Einführung in die Welt von Java",
		description:
			"## Lernziele\r\n* Einrichtung der Arbeitsumgebung\r\n* Imperative Programmierung\r\n* Objektorientierte Programmierung\r\n\r\nEs werden keine Informatik- / Programierkentnisse vorausgesetzt",
		imgUrl: "https://cdn.iconscout.com/icon/free/png-512/java-43-569305.png",
		subjectId: 1,
		createdAt: new Date(2022, 4, 20),
		updatedAt: new Date(2022, 5, 1),
		content: createCourseContent(
			lessons.map(chapter => ({
				title: chapter.title,
				description: chapter.description,
				content: chapter.content.map(lesson => ({ lessonId: lesson.lessonId }))
			}))
		),
		meta: {}
	}
].map(course => ({
	...course,
	meta: createCourseMeta(course)
}));

const authors = [
	createAuthor(
		"J. Gosling",
		"https://www.pngall.com/wp-content/uploads/7/Ryan-Gosling-PNG-Picture.png",
		lessons,
		courses
	)
];

export async function courseSeed(): Promise<void> {
	console.log("\x1b[34m%s\x1b[0m", "Java Example");

	await prisma.course.createMany({ data: courses });
	console.log(" - %s\x1b[32m ✔\x1b[0m", "Courses");
	await prisma.lesson.createMany({
		data: lessons.flatMap(chapter => chapter.content.map(lesson => lesson))
	});
	console.log(" - %s\x1b[32m ✔\x1b[0m", "Lessons");

	await prisma.specialization.update({
		where: { specializationId: 1 },
		data: {
			courses: {
				connect: courses.map(course => ({ courseId: course.courseId }))
			}
		}
	});
	console.log(" - %s\x1b[32m ✔\x1b[0m", "Connect Specialization to Course");

	for (const author of authors) {
		await prisma.user.create({ data: author });
	}
	console.log(" - %s\x1b[32m ✔\x1b[0m", "Authors");

	console.log("\x1b[34m%s\x1b[32m ✔\x1b[0m", "Java Example");
}
