import { ResolvedValue } from "@self-learning/types";
import { getLearningGoals } from "../goals/access-learning-goal";

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
};
