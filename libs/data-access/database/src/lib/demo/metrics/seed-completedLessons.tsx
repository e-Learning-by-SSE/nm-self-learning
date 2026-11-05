import { createPrismaClient } from "../../prisma-client";
import lessonsRaw from "./data/lesson.json";

const prisma = createPrismaClient();

export async function createCompletedLessons(userData: { id: string; name: string }[]) {
	try {
		const completedLessonsData = [];

		// Generate completed lessons for each user in userData
		completedLessonsData.push(
			...userData.flatMap((user, userIndex) =>
				lessonsRaw.flatMap(course =>
					course.content.flatMap((lesson, lessonIndex) =>
						Math.random() < 0.8
							? [
									{
										lessonId: lesson.lessonId,
										username: user.name,
										courseId: course.courseId,
										performanceScore:
											0.7 + ((userIndex + lessonIndex) % 4) * 0.1
									}
								]
							: []
					)
				)
			)
		);

		// Enroll "potter" to have completed lessons in all courses
		completedLessonsData.push(
			...lessonsRaw.flatMap(course =>
				course.content.flatMap((lesson, lessonIndex) =>
					Math.random() < 0.8
						? [
								{
									lessonId: lesson.lessonId,
									username: "potter",
									courseId: course.courseId,
									performanceScore: 0.7 + (lessonIndex % 4) * 0.1
								}
							]
						: []
				)
			)
		);

		// Seed a consistent lesson history for Dumbledore's magic courses.
		completedLessonsData.push(
			...lessonsRaw.flatMap(course =>
				course.content.flatMap((lesson, index) => {
					if (index % 4 === 3) return [];

					const ageInDays = (course.content.length - 1 - index) * 4;
					return [
						{
							lessonId: lesson.lessonId,
							username: "dumbledore",
							courseId: course.courseId,
							createdAt: new Date(Date.now() - ageInDays * 24 * 60 * 60 * 1000),
							performanceScore: 0.7 + (index % 4) * 0.1
						}
					];
				})
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
