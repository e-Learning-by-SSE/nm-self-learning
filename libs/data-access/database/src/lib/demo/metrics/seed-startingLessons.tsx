import { PrismaClient } from "@prisma/client";
import lessonsRaw from "./data/lesson.json";

const prisma = new PrismaClient();

export async function createStartingLessons(userData: { id: string; name: string }[]) {
	try {
		const startedLessonsData = [];

		// Generate started lessons for each user in userData
		startedLessonsData.push(
			...userData.flatMap(user =>
				lessonsRaw.flatMap(course =>
					course.content.flatMap(lesson => ({
						lessonId: lesson.lessonId,
						username: user.name,
						courseId: course.courseId
					}))
				)
			)
		);

		// Enroll "potter" to have started lessons in all courses
		startedLessonsData.push(
			...lessonsRaw.flatMap(course =>
				course.content.flatMap(lesson => ({
					lessonId: lesson.lessonId,
					username: "potter",
					courseId: course.courseId
				}))
			)
		);

		await prisma.startedLesson.createMany({
			data: startedLessonsData
		});

		console.log(" - %s\x1b[32m ✔\x1b[0m", "Started Lessons");
	} catch (error) {
		console.error("Error creating started lessons:", error);
	} finally {
		await prisma.$disconnect();
	}
}
