import { AchievementMeta, AchievementWithProgress } from "@self-learning/types";
import { checkGradeLessonTotal } from "./conditions/grade-lessons-total";
import { checkDailyStreak } from "./conditions/streak";
import { checkTimeLearnedToday } from "./conditions/focus-time";

/**
 * Condition checkers for different achievement groups.
 * Each checker function takes an achievement, userId, and context as parameters
 * and returns a boolean indicating whether the condition is fulfilled.
 */

type GroupDiscriminators = AchievementMeta["group"];

export const ACHIEVEMENT_CONDITION_CHECKERS: Record<GroupDiscriminators, ConditionChecker> = {
	daily_streak: checkDailyStreak,
	grade_lessons_serial: async () => {
		return {};
	},
	grade_lessons_total: checkGradeLessonTotal,
	focus_time: checkTimeLearnedToday
};

export type ConditionCheckerContext = Record<string, unknown>;

export type AchievementProcess = {
	newValue?: number | null;
};

export type ConditionChecker = (
	achievement: AchievementWithProgress,
	username: string,
	context: ConditionCheckerContext
) => Promise<AchievementProcess>;
