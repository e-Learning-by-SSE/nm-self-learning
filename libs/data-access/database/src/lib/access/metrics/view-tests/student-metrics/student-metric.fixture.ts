import { Prisma, PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";

/** Runs setup and assertions in one transaction, rolling back even when the test succeeds. */
export function studentMetricTest(run: (prisma: Prisma.TransactionClient) => Promise<void>) {
	return async () => {
		const prisma = new PrismaClient();
		const rollback = new Error("Roll back student metric test data");

		try {
			await prisma.$transaction(async transaction => {
				await run(transaction);
				throw rollback;
			});
		} catch (error) {
			if (error !== rollback) {
				throw error;
			}
		} finally {
			await prisma.$disconnect();
		}
	};
}

export function createMetricStudent(prisma: Prisma.TransactionClient) {
	const username = `student-metric-${randomUUID()}`;
	return prisma.user.create({
		data: {
			name: username,
			displayName: username,
			student: { create: { username } }
		}
	});
}

export function createMetricCourse(prisma: Prisma.TransactionClient) {
	const courseId = `student-metric-course-${randomUUID()}`;
	return prisma.course.create({
		data: {
			courseId,
			slug: courseId,
			title: "Student Metric Test Course",
			subtitle: "A course for student metric tests",
			content: {},
			meta: {},
			version: 1,
			type: "STATIC"
		}
	});
}

export function createMetricLearningSession(
	prisma: Prisma.TransactionClient,
	username: string,
	courseId?: string
) {
	return prisma.eventLog.createMany({
		data: [
			{
				username,
				courseId,
				createdAt: new Date("2024-01-01T10:00:00Z"),
				type: "login"
			},
			{
				username,
				courseId,
				createdAt: new Date("2024-01-01T10:30:00Z"),
				type: "logout"
			}
		]
	});
}

export async function createMetricQuizAnswer(
	prisma: Prisma.TransactionClient,
	username: string,
	courseId: string
) {
	const lessonId = `student-metric-lesson-${randomUUID()}`;
	const createdAt = new Date("2024-01-01T10:15:00Z");
	return prisma.lesson.create({
		data: {
			lessonId,
			slug: lessonId,
			title: "Student Metric Test Lesson",
			content: {},
			meta: {},
			starts: { create: { username, courseId, createdAt } },
			quizAttempts: {
				create: {
					username,
					state: "COMPLETED",
					createdAt,
					QuizAnswer: {
						create: {
							questionId: `student-metric-question-${randomUUID()}`,
							createdAt,
							answer: {},
							isCorrect: true
						}
					}
				}
			}
		}
	});
}
