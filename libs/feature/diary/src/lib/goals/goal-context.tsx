import { createContext, PropsWithChildren, useContext } from "react";
import { GoalFormModel, StatusUpdateCallback } from "../util/types";
import { IdSet } from "@self-learning/util/common";

type LearningGoalContextType = {
	userGoals: IdSet<GoalFormModel>;
	onStatusUpdate?: StatusUpdateCallback;
	onCreateGoal?: (parent?: GoalFormModel) => void;
};

const LearningGoalContext = createContext<LearningGoalContextType | undefined>(undefined);

export const useLearningGoalContext = () => {
	const context = useContext(LearningGoalContext);
	if (!context) {
		throw new Error("useLearningGoalContext must be used within a LearningGoalProvider");
	}
	return context;
};

type LearningGoalProviderProps = PropsWithChildren<LearningGoalContextType>;

export const LearningGoalProvider = ({ children, ...rest }: LearningGoalProviderProps) => {
	return (
		<LearningGoalContext.Provider value={{ ...rest }}>{children}</LearningGoalContext.Provider>
	);
};
