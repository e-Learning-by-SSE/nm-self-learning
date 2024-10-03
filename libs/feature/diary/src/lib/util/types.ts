import { LearningGoal, ResolvedValue } from "@self-learning/types";
import { getLearningGoals } from "../goals/access-learning-goal";
import { LearningGoalStatus } from "@prisma/client";

// used only inside the lib

export type LearningGoalType = ResolvedValue<typeof getLearningGoals>[number];

export type Technique = {
	name: string;
	id: string;
	score?: number;
};

export type Strategy = {
	techniques: Technique[];
	id: string;
	name: string;
	description: string;
};

export type Goal = LearningGoalType | LearningGoal;
export type StatusUpdateCallback = (goal: Goal, status: LearningGoalStatus) => void;
