import { createContext, ReactNode, useContext } from "react";
import { Goal, StatusUpdateCallback } from "../util/types";
import { LearningSubGoal } from "@self-learning/types";

type LearningGoalContextType = {
	userGoals: Goal[];
	onStatusUpdate: StatusUpdateCallback;
	moveSubGoal: (subGoal: LearningSubGoal, direction: string, subGoals: LearningSubGoal[]) => void;
};

const LearningGoalContext = createContext<LearningGoalContextType | undefined>(undefined);

export const useLearningGoalContext = () => {
	const context = useContext(LearningGoalContext);
	if (!context) {
		throw new Error("useLearningGoalContext must be used within a LearningGoalProvider");
	}
	return context;
};

type LearningGoalProviderProps = {
	children: ReactNode;
	userGoals: Goal[];
	onStatusUpdate: StatusUpdateCallback;
	moveSubGoal: (subGoal: LearningSubGoal, direction: string, subGoals: LearningSubGoal[]) => void;
};

export const LearningGoalProvider = ({
	children,
	userGoals,
	onStatusUpdate,
	moveSubGoal
}: LearningGoalProviderProps) => {
	return (
		<LearningGoalContext.Provider value={{ userGoals, onStatusUpdate, moveSubGoal }}>
			{children}
		</LearningGoalContext.Provider>
	);
};
