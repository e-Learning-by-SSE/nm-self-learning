import { AchievementMeta, AchievementWithProgress } from "@self-learning/types";
import { checkGradeLessonTotal } from "./conditions/grade-lessons-total";
import { checkStreak } from "./conditions/streak";

/**
 * Condition checkers for different achievement groups.
 * Each checker function takes an achievement, userId, and context as parameters
 * and returns a boolean indicating whether the condition is fulfilled.
 */

type GroupDiscriminators = AchievementMeta["group"];

export const ACHIEVEMENT_CONDITION_CHECKERS: Record<GroupDiscriminators, ConditionChecker> = {
	streak: checkStreak,
	grade_lessons_serial: async () => {
		// TODO Add logic for perfect_lessons_serial condition
		return { type: "unchanged" };
	},
	grade_lessons_total: checkGradeLessonTotal,
	focus: async () => {
		// TODO Add logic for focus condition
		return { type: "unchanged" };
	}
};

export type ConditionCheckerContext = Record<string, unknown>;

type ProgressMadeType = "earned" | "progressed" | "regressed" | "unchanged";

export type AchievementProcess = {
	type: ProgressMadeType;
	newValue?: number;
};

export type ConditionChecker = (
	achievement: AchievementWithProgress,
	userId: string,
	context: ConditionCheckerContext
) => Promise<AchievementProcess>;
