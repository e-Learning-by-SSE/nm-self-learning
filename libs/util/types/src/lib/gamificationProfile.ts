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
