import { LessonType, PrismaClient } from "@prisma/client";
import lessonsRaw from "./data/lesson.json";

const prisma = new PrismaClient();

export async function createLessons() {
	console.log("\x1b[94m%s\x1b[0m", "Creating lessons...");

	try {
		const lessonsData = lessonsRaw.map(lesson => {
			const { ...rest } = lesson;
			return {
				...rest,
				lessonType: LessonType[LessonType.TRADITIONAL]
			};
		});

		await prisma.lesson.createMany({ data: lessonsData });

		console.log("Lessons successfully created.");
	} catch (error) {
		console.error("Error creating lessons:", error);
	} finally {
		await prisma.$disconnect();
	}
}
