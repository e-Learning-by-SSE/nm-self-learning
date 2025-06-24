import { PrismaClient } from "@prisma/client";
import { checkAndAwardAchievements, convertAchievement } from "@self-learning/achievements";
import { database } from "@self-learning/database";
import {
	AchievementWithProgress,
	GamificationProfile,
	achievementTriggerEnum
} from "@self-learning/types";
import { isTruthy } from "@self-learning/util/common";
import { TRPCError } from "@trpc/server";
import { addHours, addMinutes } from "date-fns";
import { z } from "zod";
import { authProcedure, t } from "../trpc";
import { createNotification } from "@self-learning/ui/notifications";
import { createEventLogEntry } from "@self-learning/util/eventlog";

export async function getProfile(username: string, tx?: PrismaClient) {
	const client = tx || database;
	const profile = await client.gamificationProfile.findUniqueOrThrow({
		where: { username }
	});
	return profile as unknown as GamificationProfile;
}

export const gamificationRouter = t.router({
	getGamificationProfile: authProcedure.query(async ({ ctx }) => {
		return getProfile(ctx.user.name);
	}),

	refireStreak: authProcedure.mutation(async ({ ctx }) => {
		const username = ctx.user.name;
		const profile = await getProfile(username);

		// 2. Check if user has enough energy
		if (profile.energy < 2) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "Not enough flames to refire streak"
			});
		}

		// 3. Update the streak status and energy count
		const { energy, loginStreak } = profile;
		const newEnergy = energy - 2;
		loginStreak.status = "active";
		loginStreak.count += 1;
		const updated = await database.gamificationProfile.update({
			where: { username },
			data: {
				energy: newEnergy,
				loginStreak: loginStreak
			}
		});
		return updated;
	}),

	pauseStreak: authProcedure.mutation(async ({ ctx }) => {
		const username = ctx.user.name;
		// eslint-disable-next-line prefer-const
		let { loginStreak, energy } = await getProfile(username);

		// 2. Check if user has enough flames and isn't already paused
		if (energy < 1 || loginStreak.status === "paused") {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message:
					loginStreak.status === "paused"
						? "Streak is already paused"
						: "Not enough flames to pause streak"
			});
		}

		// 3. Calculate pause end time (24 hours from now)
		const pauseUntil = addHours(new Date(), 24);

		// 4. Update the streak status, flame count, and set pause end time
		loginStreak.status = "paused";
		loginStreak.pausedUntil = pauseUntil;
		energy -= 1;
		const updatedStreak = await database.gamificationProfile.update({
			where: { username },
			data: {
				loginStreak,
				energy,
				lastLogin: new Date()
			}
		});
		return updatedStreak;
	}),
	resetStreak: authProcedure.mutation(async ({ ctx }) => {
		const username = ctx.user.name;
		return database.gamificationProfile.updateMany({
			where: {
				username,
				loginStreak: {
					path: ["status"],
					equals: "broken"
				}
			},
			data: {
				loginStreak: { count: 1, status: "active" }
			}
		});
	}),
	earnAchievements: authProcedure
		.input(z.object({ trigger: achievementTriggerEnum }))
		.mutation(async ({ ctx, input }) => {
			const username = ctx.user.name;
			const { trigger } = input;
			const achievements = await checkAndAwardAchievements({ trigger, username });
			return achievements satisfies AchievementWithProgress[];
		}),
	getOwnAchievements: authProcedure.query(async ({ ctx }) => {
		const achievements = await database.achievement.findMany({
			include: {
				progressBy: {
					where: { username: ctx.user.name },
					select: { progressValue: true, redeemedAt: true, updatedAt: true }
				}
			},
			orderBy: [{ category: "asc" }, { requiredValue: "asc" }]
		});
		const achievmentWithProgress = achievements
			.map(
				achievement =>
					convertAchievement(achievement) as AchievementWithProgress | undefined
			)
			.filter(isTruthy);
		return achievmentWithProgress;
	}),
	getOverviewStats: authProcedure.query(async ({ ctx }) => {
		// Alle Achievements mit Progress holen
		const achievementsWithProgress = await database.achievement.findMany({
			include: {
				progressBy: {
					where: { username: ctx.user.name },
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
				select: { requiredValue: true, xpReward: true }
			});

			// Check if the achievement exists and is earned but not redeemed
			const achievementProgress = await database.achievementProgress.findUniqueOrThrow({
				where: {
					username_achievementId: {
						username: ctx.user.name,
						achievementId
					}
				},
				include: {
					gamificationProfile: {
						select: { xp: true }
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
					redeemedAt: new Date(),
					gamificationProfile: {
						update: {
							xp: {
								increment: achievement.xpReward
							}
						}
					}
				},
				include: {
					gamificationProfile: {
						select: { xp: true }
					}
				}
			});

			const newRewards = getNewRewards(
				achievementProgress.gamificationProfile.xp,
				updated.gamificationProfile.xp
			);

			if (newRewards > 0) {
				database.$transaction(async tx => {
					await tx.gamificationProfile.update({
						where: { username: ctx.user.name },
						data: {
							energy: {
								increment: newRewards
							}
						}
					});
					await createEventLogEntry({
						username: ctx.user.name,
						type: "ACHIEVEMENT_REDEEMED",
						resourceId: achievementId,
						payload: undefined
					});
					return createNotification({
						component: "NewEnergy",
						props: { count: newRewards },
						targetAudience: "user",
						displayFrom: new Date(),
						displayUntil: addMinutes(new Date(), 5),
						targetUserIds: ctx.user.id,
						tx: tx
					});
				});
			}

			return { redeemedAt: updated.redeemedAt };
		})
});

function getNewRewards(previousXp: number, currentXp: number): number {
	const prevLevel = Math.floor(previousXp / 50);
	const newLevel = Math.floor(currentXp / 50);

	return Math.max(0, newLevel - prevLevel);
}
