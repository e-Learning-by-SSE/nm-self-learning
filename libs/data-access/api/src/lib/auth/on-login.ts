import { database } from "@self-learning/database";
import { createNotification } from "@self-learning/ui/notifications";
import { createEventLogEntry } from "@self-learning/util/eventlog";
import { differenceInHours } from "date-fns";
import { defaultGamificationProfileMeta } from "libs/util/types/src/lib/gamificationProfile";
import { EventCallbacks } from "next-auth";

type SigninCallback = EventCallbacks["signIn"];

async function logLogin({ user }: Parameters<SigninCallback>[0]): Promise<void> {
	if (!user.name || !user.id) return;
	await createEventLogEntry({
		username: user.name,
		type: "USER_LOGIN",
		resourceId: user.id,
		payload: undefined
	});
}

/**
 * Updates user's login streak when they sign in
 * Increments streak if last login was more than 24h ago
 */
async function updateLoginStreak({ user }: Parameters<SigninCallback>[0]): Promise<void> {
	if (!user?.id) return;

	const now = new Date();

	return await database.$transaction(async tx => {
		const profile = await tx.gamificationProfile.findUnique({
			where: { userId: user.id },
			select: { lastLogin: true, loginStreak: true, meta: true }
		});

		const newMeta = structuredClone(defaultGamificationProfileMeta);
		newMeta.loginStreak.count = 1;
		newMeta.flames.count = 2;

		if (!profile) {
			await tx.gamificationProfile.create({
				data: {
					userId: user.id,
					lastLogin: now,
					loginStreak: 1,
					meta: newMeta,
					user: {
						connect: { id: user.id }
					}
				}
			});
			await createNotification({
				tx,
				component: "StreakInfoDialog",
				props: {
					trigger: "attention"
				},
				targetAudience: "user",
				targetUser: user.id
			});
			return;
		}

		const { lastLogin, loginStreak } = profile;

		let newStreakValue = loginStreak;
		if (lastLogin) {
			const hoursSinceLastLogin = differenceInHours(now, lastLogin);

			if (hoursSinceLastLogin >= 24 && hoursSinceLastLogin < 48) {
				newStreakValue = loginStreak + 1;
				await createNotification({
					tx,
					component: "StreakInfoDialog",
					props: {
						trigger: "increase"
					},
					targetAudience: "user",
					targetUser: user.id
				});
			} else if (hoursSinceLastLogin >= 48) {
				newStreakValue = 1;
				await createNotification({
					tx,
					component: "StreakInfoDialog",
					props: {
						trigger: "reset"
					},
					targetAudience: "user",
					targetUser: user.id
				});
			}
		}

		await tx.gamificationProfile.update({
			where: { userId: user.id },
			data: {
				lastLogin: now,
				loginStreak: newStreakValue
			}
		});
	});
}

export const loginCallbacks: SigninCallback[] = [logLogin, updateLoginStreak];
