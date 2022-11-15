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

faker.seed(2);

const prisma = new PrismaClient();

function createLesson(
	title: string,
	subtitle: string | null,
	description: string,
	imgUrl: string,
	content: LessonContent[],
	questions: QuizContent
) {
	const lesson: Prisma.LessonCreateInput = {
		title,
		lessonId: faker.random.alphaNumeric(8),
		slug: slugify(title, { lower: true, strict: true }),
		subtitle: subtitle,
		description: description,
		imgUrl: imgUrl,
		content: content,
		quiz: questions,
		meta: {}
	};

	lesson.meta = createLessonMeta(lesson as any) as unknown as Prisma.JsonObject;

	return lesson;
}

const javaLessons = [
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
			javaLessons.map(chapter => ({
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

const authors: Prisma.UserCreateInput[] = [
	{
		name: "J. Gosling",
		accounts: {
			create: [
				{
					provider: "demo",
					providerAccountId: "j-gosling",
					type: "gosling-account"
				}
			]
		},
		author: {
			create: {
				displayName: "J. Gosling",
				slug: "j-gosling",
				imgUrl: "https://www.pngall.com/wp-content/uploads/7/Ryan-Gosling-PNG-Picture.png",
				courses: {
					connect: {
						courseId: courses[0].courseId
					}
				},
				lessons: {
					connect: extractLessonIds(javaLessons).map(lessonId => ({ lessonId }))
				},
				teams: {
					create: []
				}
			}
		}
	}
];

export async function courseSeed(): Promise<void> {
	console.log("\x1b[34m%s\x1b[0m", "Java Example");

	await prisma.course.createMany({ data: courses });
	console.log(" - %s\x1b[32m ✔\x1b[0m", "Courses");
	await prisma.lesson.createMany({
		data: javaLessons.flatMap(chapter => chapter.content.map(lesson => lesson))
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
