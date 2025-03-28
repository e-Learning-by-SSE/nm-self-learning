import { createContext, PropsWithChildren, useContext } from "react";
import { Goal, StatusUpdateCallback } from "../util/types";

type LearningGoalContextType = {
	userGoals: Goal[];
	onStatusUpdate?: StatusUpdateCallback;
	onCreateGoal?: (parent?: Goal) => void;
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
