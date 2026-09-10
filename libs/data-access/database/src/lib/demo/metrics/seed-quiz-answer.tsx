import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createQuizAnswers(quizAttempts: any[]) {
	try {
		// InitialDate today - 2 weeks ago
		const initialDate = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

		const quizAnswers = quizAttempts.flatMap(({ attemptId }) => {
			// Random date for the next 4 weeks
			const date = new Date(initialDate.getTime() + Math.random() * 1000 * 60 * 60 * 24 * 28);
			date.setHours(Math.floor(Math.random() * 6) + 12, 0, 0, 0); // Set hours between 12 pm and 6 pm

			const numAnswers = Math.floor(Math.random() * 6) + 4; // Random number between 4 and 9

			let current = new Date(date);
			let counter = 1;
			return Array.from({ length: numAnswers }, () => {
				const createdAt = new Date(current);

				// 50% chance to increment by 1 hour, else keep the same hour
				if (Math.random() < 0.5) {
					current = new Date(current.getTime() + 60 * 60 * 1000);
				}

				const questionId = `q_${attemptId}_${counter++}`;
				return {
					createdAt,
					quizAttemptId: attemptId,
					questionId,
					answer: "Sample Answer",
					isCorrect: Math.random() < 0.7 // 70% chance of being correct
				};
			});
		});

		await prisma.quizAnswer.createMany({ data: quizAnswers });

		console.log(" - %s\x1b[32m ✔\x1b[0m", "Quiz Answers");
	} catch (error) {
		console.error("Error seeding quiz answer event log:", error);
	} finally {
		await prisma.$disconnect();
	}
}
