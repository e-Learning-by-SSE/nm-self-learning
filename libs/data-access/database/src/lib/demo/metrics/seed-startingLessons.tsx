import { PrismaClient } from "@prisma/client";
import lessonsRaw from "./data/lesson.json";

const prisma = new PrismaClient();

export async function createStartingLessons() {
	console.log("\x1b[94m%s\x1b[0m", "Creating starting lessons...");

	try {
		const lessonsData = lessonsRaw.map(lessonsRaw => {
			const { lessonId } = lessonsRaw;
			return {
				lessonId,
				username: "potter",
				courseId: "magical-test-course"
			};
		});

		lessonsData.push(
			...lessonsRaw.map(({ lessonId }) => ({
				lessonId,
				username: "weasley",
				courseId: "magical-test-course"
			}))
		);

		await prisma.startedLesson.createMany({ data: lessonsData });

		console.log("Started lessons successfully created.");
	} catch (error) {
		console.error("Error creating started lessons:", error);
	} finally {
		await prisma.$disconnect();
	}
}
