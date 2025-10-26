import { PrismaClient } from "@prisma/client";
import lessonsRaw from "./data/lesson.json";

const prisma = new PrismaClient();

export async function createQuizAttempts() {
	console.log("\x1b[94m%s\x1b[0m", "Seeding Quiz Attempt Event Log...");

	try {
		const quizAttempts = [];

		// Create between 5 and 10 Quiz attempts for user "Potter" for every lesson in the lessons data

		lessonsRaw.forEach(({ lessonId }) => {
			for (let i = 0; i < Math.floor(Math.random() * 6) + 5; i++) {
				quizAttempts.push({
					attemptId: `${lessonId}_potter_${i + 1}`,
					state: "COMPLETED",
					username: "potter",
					lessonId
				});
			}
		});

		quizAttempts.push({
			attemptId: "lesson-1_potter_inprogress_1",
			state: "IN_PROGRESS",
			username: "potter",
			lessonId: "lesson-1"
		}); // One in-progress attempt

		quizAttempts.push({
			attemptId: "lesson-2_potter_inprogress_2",
			state: "IN_PROGRESS",
			username: "potter",
			lessonId: "lesson-2"
		}); // One in-progress attempt

		await prisma.quizAttempt.createMany({ data: quizAttempts });

		console.log("Quiz attempts for Potter created successfully.");

		return quizAttempts;
	} catch (error) {
		console.error("Error seeding quiz attempt event log:", error);
	} finally {
		await prisma.$disconnect();
	}

	return [];
}
