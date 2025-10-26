import { PrismaClient } from "@prisma/client";
import lessonsRaw from "./data/lesson.json";
import usersRaw from "./data/user.json";

const prisma = new PrismaClient();

export async function createStartingLessons() {
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

		await prisma.startedLesson.createMany({ data: lessonsData });

		console.log(" - %s\x1b[32m ✔\x1b[0m", "Started Lessons");
	} catch (error) {
		console.error("Error creating started lessons:", error);
	} finally {
		await prisma.$disconnect();
	}
}
