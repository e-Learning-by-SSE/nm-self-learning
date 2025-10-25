import { PrismaClient } from "@prisma/client";
import lessonsRaw from "./data/lesson.json";

const prisma = new PrismaClient();

export async function createCompletedLessons() {
	console.log("\x1b[94m%s\x1b[0m", "Creating completed lessons...");

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

		// Cut the last 5 lessons for weasley to simulate incomplete progress
		lessonsData.splice(-5, 5);

		await prisma.completedLesson.createMany({ data: lessonsData });

		console.log("Completed lessons successfully created.");
	} catch (error) {
		console.error("Error creating completed lessons:", error);
	} finally {
		await prisma.$disconnect();
	}
}
