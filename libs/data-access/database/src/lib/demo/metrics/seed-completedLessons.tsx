import { PrismaClient } from "@prisma/client";
import lessonsRaw from "./data/lesson.json";
import usersRaw from "./data/user.json";

const prisma = new PrismaClient();

export async function createCompletedLessons() {
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

		console.log(" - %s\x1b[32m ✔\x1b[0m", "Completed Lessons");
	} catch (error) {
		console.error("Error creating completed lessons:", error);
	} finally {
		await prisma.$disconnect();
	}
}
