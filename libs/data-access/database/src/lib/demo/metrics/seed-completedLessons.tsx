import { PrismaClient } from "@prisma/client";
import lessonsRaw from "./data/lesson.json";

const prisma = new PrismaClient();

export async function createCompletedLessons(userData: { id: string; name: string }[]) {
	try {
		const completedLessonsData = [];

		// Generate completed lessons for each user in userData
		completedLessonsData.push(
			...userData.flatMap(user =>
				lessonsRaw.flatMap(course =>
					course.content.flatMap(
						lesson =>
							Math.random() < 0.8
								? [
										{
											lessonId: lesson.lessonId,
											username: user.name,
											courseId: course.courseId
										}
									]
								: [] // return an empty array instead of null
					)
				)
			)
		);

		// Enroll "potter" to have completed lessons in all courses
		completedLessonsData.push(
			...lessonsRaw.flatMap(course =>
				course.content.flatMap(
					lesson =>
						Math.random() < 0.8
							? [
									{
										lessonId: lesson.lessonId,
										username: "potter",
										courseId: course.courseId
									}
								]
							: [] // return an empty array instead of null
				)
			)
		);

		await prisma.completedLesson.createMany({ data: completedLessonsData });

		console.log(" - %s\x1b[32m ✔\x1b[0m", "Completed Lessons");
	} catch (error) {
		console.error("Error creating completed lessons:", error);
	} finally {
		await prisma.$disconnect();
	}
}
