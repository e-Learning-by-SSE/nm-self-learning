// Server-side tRPC router in src/server/api/routers/streak.ts

import { PrismaClient } from "@prisma/client";
import { database } from "@self-learning/database";
import { checkAndAwardAchievements } from "@self-learning/achievements";
import {
	AchievementWithProgress,
	GamificationProfile,
	GamificationProfileMeta,
	achievementMetaSchema,
	achievementTriggerEnum,
	defaultGamificationProfileMeta
} from "@self-learning/types";
import { isTruthy } from "@self-learning/util/common";
import { TRPCError } from "@trpc/server";
import { addHours } from "date-fns";
import { z } from "zod";
import { authProcedure, t } from "../trpc";

export async function getProfileMeta(username: string, tx?: PrismaClient) {
	const client = tx || database;
	let profile = await client.gamificationProfile.findUniqueOrThrow({
		where: { username }
	});
	if (!profile.meta) {
		profile = {
			...profile,
			meta: defaultGamificationProfileMeta
		};
	}

	return {
		...profile,
		meta: profile.meta as unknown as GamificationProfileMeta
	} as GamificationProfile;
}

export const gamificationRouter = t.router({
	getGamificationProfile: authProcedure.query(async ({ ctx }) => {
		const userId = ctx.user.id;
		return getProfileMeta(userId);
	}),

	refireStreak: authProcedure.mutation(async ({ ctx }) => {
		const userId = ctx.user.id;
		const profile = await getProfileMeta(userId);

		// 2. Check if user has enough flames
		if (profile.meta.flames.count < 2) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "Not enough flames to refire streak"
			});
		}

		const newStreakProfile = {
			...profile.meta,
			flames: {
				...profile.meta.flames,
				count: profile.meta.flames.count - 2
			},
			loginStreak: {
				...profile.meta.loginStreak,
				status: "active",
				pauseUntil: null
			}
		} satisfies GamificationProfileMeta;

		// 3. Update the streak status and flame count
		const updated = await database.gamificationProfile.update({
			where: { userId },
			data: {
				meta: newStreakProfile
			}
		});

		return {
			...updated,
			meta: updated.meta as unknown as GamificationProfileMeta
		} as GamificationProfile;
	}),

	pauseStreak: authProcedure.mutation(async ({ ctx }) => {
		const userId = ctx.user.id;
		const { meta } = await getProfileMeta(userId);

		// 2. Check if user has enough flames and isn't already paused
		if (meta.flames.count < 1 || meta.loginStreak.status === "paused") {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message:
					meta.loginStreak.status === "paused"
						? "Streak is already paused"
						: "Not enough flames to pause streak"
			});
		}

		// 3. Calculate pause end time (24 hours from now)
		const pauseUntil = addHours(new Date(), 24);

		// 4. Update the streak status, flame count, and set pause end time
		const updatedStreak = await database.gamificationProfile.update({
			where: { userId },
			data: {
				meta: {
					...meta,
					loginStreak: {
						...meta.loginStreak,
						status: "paused",
						pauseUntil
					},
					flames: {
						...meta.flames,
						count: meta.flames.count - 1
					}
				}
			}
		});

		return {
			...updatedStreak,
			meta: updatedStreak.meta as unknown as GamificationProfileMeta
		} as GamificationProfile;
	}),
	earnAchievements: authProcedure
		.input(z.object({ trigger: achievementTriggerEnum }))
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.user.id;
			const { trigger } = input;
			const achievements = await checkAndAwardAchievements({ trigger, userId });
			return achievements satisfies AchievementWithProgress[];
		}),
	getOwnAchievements: authProcedure.query(async ({ ctx }) => {
		const userId = ctx.user.id;
		const achievements = await database.achievement.findMany({
			include: {
				progressBy: {
					where: { userId },
					select: { progressValue: true, redeemedAt: true }
				}
			},
			orderBy: [{ category: "asc" }, { requiredValue: "asc" }]
		});
		const achievmentWithProgress = achievements.map(achievement => {
			const { progressValue, redeemedAt } = achievement.progressBy[0] || {
				progressValue: 0,
				redeemedAt: null
			};
			const meta = achievementMetaSchema.parse(achievement.meta);
			return { ...achievement, meta, progressValue, redeemedAt };
		});
		return achievmentWithProgress as AchievementWithProgress[];
	}),
	getOverviewStats: authProcedure.query(async ({ ctx }) => {
		const userId = ctx.user.id;

		// Alle Achievements mit Progress holen
		const achievementsWithProgress = await database.achievement.findMany({
			include: {
				progressBy: {
					where: { userId },
					select: { progressValue: true, redeemedAt: true }
				}
			}
		});

		// Client-side filtern
		const unlockedCount = achievementsWithProgress.filter(a =>
			isTruthy(a.progressBy[0]?.redeemedAt)
		).length;

		const categories = await database.achievement.groupBy({
			by: ["category"],
			_count: { category: true }
		});

		return {
			total: achievementsWithProgress.length,
			unlocked: unlockedCount,
			categories: categories.map(cat => ({
				name: cat.category,
				count: cat._count.category
			}))
		};
	}),
	redeemAchievement: authProcedure
		.input(
			z.object({
				achievementId: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { achievementId } = input;

			// Get the achievement details
			const achievement = await database.achievement.findUniqueOrThrow({
				where: { id: achievementId },
				select: { requiredValue: true }
			});

			// Check if the achievement exists and is earned but not redeemed
			const achievementProgress = await database.achievementProgress.findUniqueOrThrow({
				where: {
					userId_achievementId: {
						userId: ctx.user.id,
						achievementId
					}
				}
			});

			// Check if achievement criteria are met but not yet redeemed
			if (achievementProgress.progressValue < achievement.requiredValue) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Achievement criteria not yet met"
				});
			}

			if (achievementProgress.redeemedAt) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Achievement already redeemed"
				});
			}

			// Redeem the achievement
			const updated = await database.achievementProgress.update({
				where: {
					id: achievementProgress.id
				},
				data: {
					redeemedAt: new Date()
				}
			});

			return { redeemedAt: updated.redeemedAt };
		})
});
