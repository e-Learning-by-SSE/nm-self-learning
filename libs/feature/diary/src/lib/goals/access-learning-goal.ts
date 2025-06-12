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
		select: goalSelectClause
	});
}

export const goalSelectClause = {
	id: true,
	status: true,
	lastProgressUpdate: true,
	description: true,
	parentId: true,
	priority: true,
	order: true,
	children: {
		orderBy: {
			order: "asc"
		},
		select: {
			id: true
		}
	}
} as const;
