import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedQuizAnswerEventLog() {
	console.log("\x1b[94m%s\x1b[0m", "Seeding Quiz Answer Event Log...");
	try {
		// Ensure the student "potter" exists in the database
		const student = await prisma.student.findUnique({
			where: { username: "potter" }
		});

		if (!student) {
			console.error('Student "potter" not found.');
			return;
		}

		// Ensure Quiz Attempts exists
		const quizAttempt = await prisma.quizAttempt.findFirst({
			where: { attemptId: "att_potter_1" }
		});
		const quizAttempt2 = await prisma.quizAttempt.findFirst({
			where: { attemptId: "att_potter_2" }
		});

		if (!quizAttempt || !quizAttempt2) {
			console.error("Quiz Attempt not found.");
			return;
		}

		// Create quiz answers for Potter
		await prisma.quizAnswer.createMany({
			data: [
				{
					quizAttemptId: quizAttempt.attemptId,
					questionId: "q1",
					answer: { choice: "A" },
					isCorrect: true
				},
				{
					quizAttemptId: quizAttempt.attemptId,
					questionId: "q2",
					answer: { choice: "B" },
					isCorrect: false
				},
				{
					quizAttemptId: quizAttempt2.attemptId,
					questionId: "q3",
					answer: { choice: "C" },
					isCorrect: true
				},
				{
					quizAttemptId: quizAttempt2.attemptId,
					questionId: "q4",
					answer: { choice: "D" },
					isCorrect: true
				}
			],
			skipDuplicates: true // Avoid errors if answers already exist
		});

		console.log("Quiz answers for Potter created successfully.");
	} catch (error) {
		console.error("Error seeding quiz answer event log:", error);
	} finally {
		await prisma.$disconnect();
	}
}
