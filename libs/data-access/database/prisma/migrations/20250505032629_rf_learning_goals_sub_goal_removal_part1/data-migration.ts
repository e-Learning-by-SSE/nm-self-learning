import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
	try {
		await prisma.$transaction(async tx => {
			// Sub-goals of deprecated table
			const subGoals = await tx.learningSubGoal.findMany({
				include: {
					LearningGoal: true
				},
				// Keep order of priorities by Parent Goal to retain order when inserting
				orderBy: [{ LearningGoal: { id: "asc" } }, { priority: "asc" }]
			});

			// Insert sub-goals as new goals into the learning goals table
			for (const subGoal of subGoals) {
				// Check if Goal with Sub-Goal ID already exists
				const existingGoal = await tx.learningGoal.findFirst({
					where: {
						id: subGoal.learningGoalId
					}
				});

				const id = existingGoal ? undefined : subGoal.learningGoalId;

				await tx.learningGoal.create({
					data: {
						id: id,
						description: subGoal.description,
						status: subGoal.status,
						createdAt: subGoal.createdAt,
						lastProgressUpdate: subGoal.lastProgressUpdate,
						username: subGoal.LearningGoal.username,
						learningDiaryPageId: subGoal.LearningGoal.learningDiaryPageId,
						parentId: subGoal.learningGoalId
					}
				});
			}
		});
	} finally {
		await prisma.$disconnect();
	}
}

main().catch(e => {
	console.error(e);
	process.exit(1);
});
