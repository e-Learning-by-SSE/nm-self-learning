import { PrismaClient } from "@prisma/client";
import lessonsRaw from "./data/lesson.json";
import usersRaw from "./data/user.json";

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

		usersRaw.forEach(user => {
			lessonsRaw.forEach(lesson => {
				lessonsData.push({
					lessonId: lesson.lessonId,
					username: user.name,
					courseId: "magical-test-course"
				});
			});
		});

		// Randomly delete some completed lessons to simulate incompletion
		const filteredLessonsData = lessonsData.filter(() => Math.random() > 0.2); // 80% chance to keep

		await prisma.completedLesson.createMany({ data: filteredLessonsData });

		console.log("Completed lessons successfully created.");
	} catch (error) {
		console.error("Error creating completed lessons:", error);
	} finally {
		await prisma.$disconnect();
	}
}
