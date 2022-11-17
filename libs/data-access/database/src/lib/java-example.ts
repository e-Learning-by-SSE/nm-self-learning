import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

import { createArticle, createAuthor, createCourse, createLesson, createMultipleChoice } from './seed-functions';

faker.seed(2);

const prisma = new PrismaClient();

const chapters = [
	{
		title: "Installation",
		description: "Eirichtung einer Arbeitsumgebung zur Entwicklung von Java-Anwendungen",
		content: [
			createLesson(
				"Installation des JDKs",
				null,
				"Download und Installation des JDKs",
				"https://cdn.iconscout.com/icon/free/png-512/java-43-569305.png",
				[
					createArticle(
						"# Installation des JDKs\r\n1. Gehen Sie auf <https://adoptopenjdk.net/>\r\n1. Wählen Sie sich dort das JDK aus, wir verwenden __OpenJDK 16 (Latest)__ in Verbindung mit __HotSpot__\r\n1. Installieren sie diese und aktivieren Sie den Haken, dass die __Java_HOME__ Variable angepasst werden soll",
						20
					)
				],
				[
					createMultipleChoice(
						"Auf welchen Seitn wird ein JDK angeboten?",
						[
							{
								content: "adoptopenjdk.net",
								isCorrect: true
							},
							{
								content: "java.oracle.com",
								isCorrect: true
							},
							{
								content: "uni-hildesheim.de",
								isCorrect: false
							}
						],
						[
							"Die Uni Hi bietet selber kein JDK an.",
							"Die ersten beiden Antworten sind korrekt."
						]
					)
				]
			)
		]
	}
];

const courses = [
	createCourse(
		1,
		"Objectorientierte Programmierung mit Java",
		"Einführung in die Welt von Java",
		"## Lernziele\r\n* Einrichtung der Arbeitsumgebung\r\n* Imperative Programmierung\r\n* Objektorientierte Programmierung\r\n\r\nEs werden keine Informatik- / Programierkentnisse vorausgesetzt",
		"https://cdn.iconscout.com/icon/free/png-512/java-43-569305.png",
		chapters
	)
];

const authors = [
	createAuthor(
		"J. Gosling",
		"https://www.pngall.com/wp-content/uploads/7/Ryan-Gosling-PNG-Picture.png",
		chapters,
		courses
	)
];

export async function courseSeed(): Promise<void> {
	console.log("\x1b[34m%s\x1b[0m", "Java Example");

	await prisma.course.createMany({ data: courses });
	console.log(" - %s\x1b[32m ✔\x1b[0m", "Courses");
	await prisma.lesson.createMany({
		data: chapters.flatMap(chapter => chapter.content.map(lesson => lesson))
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
