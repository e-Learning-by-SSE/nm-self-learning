import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedQuizAttemptEventLog() {
	console.log("\x1b[94m%s\x1b[0m", "Seeding Quiz Attempt Event Log...");

	try {
		// Ensure the student "potter" exists in the database

		const student = await prisma.student.findUnique({
			where: { username: "potter" }
		});

		if (!student) {
			console.error('Student "potter" not found.');
			return;
		}

		// Ensure lesson exists
		const lessons = await prisma.lesson.findUnique({
			where: { lessonId: "cab2eb9a-c55c-445e-ac6e-f0a7911cf175" }
		});

		if (!lessons) {
			console.error("Lesson not found.");
			return;
		}

		// Create quiz attempts for Potter
		await prisma.quizAttempt.createMany({
			data: [
				{
					attemptId: "att_potter_1",
					createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
					state: "COMPLETED",
					username: student.username,
					lessonId: lessons.lessonId
				},
				{
					attemptId: "att_potter_2",
					createdAt: new Date(), // now
					state: "COMPLETED",
					username: student.username,
					lessonId: lessons.lessonId
				}
			],
			skipDuplicates: true // Avoid errors if attempts already exist
		});

		console.log("Quiz attempts for Potter created successfully.");
	} catch (error) {
		console.error("Error seeding quiz attempt event log:", error);
	} finally {
		await prisma.$disconnect();
	}
}
