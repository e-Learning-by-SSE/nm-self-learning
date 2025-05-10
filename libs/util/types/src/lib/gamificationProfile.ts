import { z } from "zod";

export const gamificationProfileMetaSchema = z.object({
	loginStreak: z.object({
		// TODO delete
		count: z.number().nonnegative().default(0),
		status: z.enum(["active", "paused", "inactive"]).default("inactive"),
		pauseUntil: z.date().optional().nullable()
	}),
	flames: z.object({
		count: z.number().nonnegative().default(0),
		maxCount: z.number().nonnegative().default(0)
	}),
	itemLog: z.array(
		z.object({
			type: z.literal("flame"),
			status: z.union([z.literal("used"), z.literal("acquired")]),
			usedAt: z.date()
		})
	)
	//xp: z.number().nonnegative().optional(),
	//level: z.number().nonnegative().optional()
});
export type GamificationProfileMeta = z.infer<typeof gamificationProfileMetaSchema>;

export const gamificationProfileSchema = z.object({
	userId: z.string(),
	lastLogin: z.date().optional(),
	loginStreak: z.number().nonnegative().default(0),
	meta: gamificationProfileMetaSchema
});
export type GamificationProfile = z.infer<typeof gamificationProfileSchema>;

export const streakInfoSchema = z.object({
	trigger: z.enum(["increase", "reset", "attention"])
});
export type StreakInfo = z.infer<typeof streakInfoSchema>;

export const defaultGamificationProfileMeta = {
	itemLog: [],
	flames: {
		count: 0,
		maxCount: 3
	},
	loginStreak: {
		count: 0,
		status: "inactive",
		pauseUntil: null
	}
} satisfies GamificationProfileMeta;

// achievement types

export const achievementMetaSchema = z.discriminatedUnion("group", [
	z.object({
		group: z.literal("perfect_lessons"),
		level: z.number().int().positive(),
		requiredCount: z.number().int().positive()
	}),
	z.object({
		group: z.literal("streak"),
		level: z.number().int().positive(),
		requiredDays: z.number().int().positive()
	}),
	z.object({
		group: z.literal("focus"),
		level: z.number().int().positive(),
		requiredMinutes: z.number().int().positive()
	})
]);

export type AchievementMeta = z.infer<typeof achievementMetaSchema>;

export const achievementTriggerEnum = z.enum([
	"lesson_completed",
	"daily_login",
	"session_time",
	"streak_check",
	"manual"
]);

export const achievementSchema = z.object({
	id: z.string().uuid(),
	code: z.string().min(1),
	title: z.string().min(1),
	description: z.string().min(1),
	xpReward: z.number().int().nonnegative(),
	category: z.string().min(1),
	createdAt: z.coerce.date(),
	trigger: achievementTriggerEnum,
	meta: achievementMetaSchema.optional()
});

export type Achievement = z.infer<typeof achievementSchema>;

export type ConditionCheckerContext = Record<string, unknown>;

export type ConditionChecker = (
	achievement: Achievement,
	userId: string,
	context: ConditionCheckerContext
) => Promise<boolean>;
