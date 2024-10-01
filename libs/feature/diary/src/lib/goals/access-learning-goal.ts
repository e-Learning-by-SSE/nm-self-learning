import { database } from "@self-learning/database";

/**
 * Fetch learning goals from database
 * @param username The username of the current user
 * @returns The learning goals of the user
 */
export async function getLearningGoals(username: string) {
	return await database.learningGoal.findMany({
		where: { username: username },
		orderBy: {
			// SE: Don't order by lastProgressUpdate, to avoid re-sorting during edit
			// I think alphabetical order by description is more intuitive to end users
			description: "asc"
		},
		select: {
			id: true,
			status: true,
			lastProgressUpdate: true,
			description: true,
			learningSubGoals: {
				orderBy: {
					priority: "asc"
				},
				select: {
					id: true,
					description: true,
					priority: true,
					status: true,
					learningGoalId: true
				}
			}
		}
	});
}
