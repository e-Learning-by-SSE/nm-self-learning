// Server-side tRPC router in src/server/api/routers/streak.ts

import { PrismaClient } from "@prisma/client";
import { database } from "@self-learning/database";
import { checkAndAwardAchievements } from "@self-learning/settings";
import {
	GamificationProfile,
	GamificationProfileMeta,
	achievementTriggerEnum,
	defaultGamificationProfileMeta
} from "@self-learning/types";
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
			return achievements;
		})
});
