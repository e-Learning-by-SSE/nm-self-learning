import { z } from "zod";

export const loginStreakSchema = z.object({
	/**
	 * The number of consecutive days the user has logged in.
	 * Resets to 0 when the streak becomes inactive.
	 */
	count: z.number().nonnegative().default(0),

	/**
	 * The current status of the login streak:
	 * - "active": User is maintaining a daily login streak.
	 * - "paused": Streak is temporarily protected (e.g., due to a streak freeze item).
	 * - "inactive": Streak is broken and can be refired by using flames
	 */
	status: z.enum(["active", "paused", "broken"]).default("active"),

	/**
	 * If the streak is "paused", this is the date until which the streak is protected.
	 * After this date, the streak will become "inactive" if not resumed.
	 * Null or undefined if the streak is not paused.
	 */
	pausedUntil: z.date().optional().nullable()
});
export type LoginStreak = z.infer<typeof loginStreakSchema>;

export const flamesSchema = z.object({
	count: z.number().nonnegative().default(0),
	maxCount: z.number().nonnegative().default(0)
});
export type Flames = z.infer<typeof flamesSchema>;

export const itemLogSchema = z.array(
	z.object({
		type: z.literal("flame"),
		status: z.union([z.literal("used"), z.literal("acquired")]),
		usedAt: z.date()
	})
);
export type ItemLog = z.infer<typeof itemLogSchema>;

// export type GamificationProfileMeta = z.infer<typeof gamificationProfileMetaSchema>;

// export const defaultGamificationProfileMeta = {
// 	itemLog: [],
// 	flames: {
// 		count: 0,
// 		maxCount: 3
// 	},
// 	loginStreak: {
// 		count: 0,
// 		status: "active",
// 		pauseUntil: null
// 	}
// } satisfies GamificationProfileMeta;

export const streakDialogTriggerEnum = z.enum([
	"dailyIncrease",
	"attentionRequired",
	"onBoard",
	"reset",
	"dashboard"
]);

export const gamificationProfileSchema = z.object({
	userId: z.string(),
	lastLogin: z.date().optional(),
	loginStreak: loginStreakSchema,
	flames: flamesSchema,
	itemLog: itemLogSchema
});

export type GamificationProfile = z.infer<typeof gamificationProfileSchema>;

/**
 * Grading levels used in achievements.
 */
export const performanceGradeSchema = z.enum([
	"PERFECT",
	"VERY_GOOD",
	"GOOD",
	"SATISFACTORY",
	"SUFFICIENT"
]);
export type PerformanceGrade = z.infer<typeof performanceGradeSchema>;

/**
 * Metadata for an achievement, distinguished by group, so it needs to be unique.
 */
export const achievementMetaSchema = z.discriminatedUnion("group", [
	z.object({
		group: z.literal("grade_lessons_serial"),
		level: z.number().int().positive(),
		grade: performanceGradeSchema
	}),
	z.object({
		group: z.literal("grade_lessons_total"),
		level: z.number().int().positive(),
		grade: performanceGradeSchema
	}),
	z.object({
		group: z.literal("daily_streak"),
		level: z.number().int().positive()
	}),
	z.object({
		group: z.literal("focus_time"),
		level: z.number().int().positive()
	})
]);

export type AchievementMeta = z.infer<typeof achievementMetaSchema>;

/**
 * Enum of the available triggers that can unlock achievements.
 */
export const achievementTriggerEnum = z.enum([
	"lesson_completed",
	"daily_login",
	"streak_check",
	"manual"
]);

/**
 * Achievement Schema used for form validation.
 */
export const achievementCreateSchema = z.object({
	code: z.string().min(1),
	title: z.string().min(1),
	description: z.string().min(1),
	xpReward: z.number().int().nonnegative(),
	category: z.string().min(1),
	trigger: achievementTriggerEnum,
	requiredValue: z.number().int().positive(),
	meta: achievementMetaSchema.optional()
});
export type AchievementFormInput = z.input<typeof achievementCreateSchema>;

/**
 * Schema for an achievement, compatible with the database.
 */
export const achievementFullSchema = achievementCreateSchema.extend({
	id: z.string().uuid(),
	createdAt: z.coerce.date()
});
export type AchievementDb = z.infer<typeof achievementFullSchema>;

export const achievementWithProgressSchema = achievementFullSchema.extend({
	progressValue: z.number().nonnegative().default(0),
	redeemedAt: z.date().optional().nullable()
});
export type AchievementWithProgress = z.infer<typeof achievementWithProgressSchema>;
