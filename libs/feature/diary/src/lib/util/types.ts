import { LearningGoal, ResolvedValue } from "@self-learning/types";
import { getLearningGoals } from "../goals/access-learning-goal";

// used only inside the lib

export type GoalsFromDb = ResolvedValue<typeof getLearningGoals>[number];

export type GoalFormModel = LearningGoal;
export type StatusUpdateCallback = (goalToChange: GoalFormModel) => void;

export function convertLearningGoal(goal: GoalsFromDb): GoalFormModel {
	return {
		...goal,
		parentId: goal.parentId ?? undefined, // Convert null to undefined
		children: goal.children.map(child => child.id), // Extract child IDs; prisma don't support nested types
		lastProgressUpdate: goal.lastProgressUpdate ?? undefined // Convert null to undefined
	};
}
