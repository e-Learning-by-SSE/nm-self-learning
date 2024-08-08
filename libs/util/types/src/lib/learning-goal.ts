import { LearningGoalStatus } from "@prisma/client";

// unsued?
export type LearningGoal = {
	status: LearningGoalStatus;
	lastProgressUpdate: Date | null;
	id: string;
	description: string;
	learningSubGoals: LearningSubGoal[];
};
export type LearningSubGoal = {
	status: LearningGoalStatus;
	id: string;
	description: string;
	priority: number;
	learningGoalId: string;
};
