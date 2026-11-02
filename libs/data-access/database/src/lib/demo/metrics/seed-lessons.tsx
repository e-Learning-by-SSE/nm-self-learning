import { createPrismaClient } from "../../prisma-client";
import { LessonType, PrismaClient } from "../../../generated/prisma/client";
import lessonsRaw from "./data/lesson.json";

const prisma = createPrismaClient();

export async function createLessons() {
	try {
		const lessonsData = lessonsRaw.flatMap(course => {
			return course.content.map(lesson => {
				const { ...rest } = lesson;
				return {
					...rest,
					lessonType: LessonType[LessonType.TRADITIONAL]
				};
			});
		});

		await prisma.lesson.createMany({ data: lessonsData });

		console.log(" - %s\x1b[32m ✔\x1b[0m", "Lessons");
	} catch (error) {
		console.error("Error creating lessons:", error);
	} finally {
		await prisma.$disconnect();
	}
}
