import { ConditionChecker } from "@self-learning/types";
import { checkStreak } from "./streak";

export const conditionCheckers: Record<string, ConditionChecker> = {
	streak: checkStreak
	// perfect_lessons: checkPerfectLessons,
	// focus: checkFocus
};
