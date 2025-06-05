import { createNewProfile } from "@self-learning/achievements";
import { database } from "@self-learning/database";
import { getExperimentStatus } from "@self-learning/profile";
import {
	Flames,
	GamificationProfile,
	LoginStreak,
	NotificationPropsMap
} from "@self-learning/types";
import { createNotification } from "@self-learning/ui/notifications";
import { createEventLogEntry } from "@self-learning/util/eventlog";
import { differenceInHours } from "date-fns";
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
	const username = user?.name?.trim();
	if (!username) return;
	const { isParticipating } = await getExperimentStatus(username);
	console.log(`User ${username} is participating in the experiment: ${isParticipating}`);
	if (!isParticipating) return;
	console.log(user);
	if (!user.features.includes("experimentalFeatures")) return;

	const now = new Date();

	return await database.$transaction(async tx => {
		const profile = await tx.gamificationProfile.findUnique({
			where: { userId: user.id },
			select: { lastLogin: true, loginStreak: true, flames: true }
		});

		let notificationStreakValue: LoginStreak;
		let notificationFlames: Flames;
		let notificationTrigger: NotificationPropsMap["StreakInfoDialog"]["trigger"];
		if (!profile) {
			const newCreatedProfile = await createNewProfile(username, tx);
			notificationStreakValue = newCreatedProfile.loginStreak;
			notificationFlames = newCreatedProfile.flames;
			notificationTrigger = "onBoard";
		} else {
			const { lastLogin, loginStreak, flames } = profile as unknown as GamificationProfile;
			notificationFlames = flames;

			const hoursSinceLastLogin = differenceInHours(now, lastLogin ?? new Date());
			if (hoursSinceLastLogin >= 24 && hoursSinceLastLogin < 48) {
				loginStreak.count++;
				loginStreak.status = "active";
				notificationTrigger = "dailyIncrease";
			} else if (hoursSinceLastLogin >= 48 && hoursSinceLastLogin < 72) {
				loginStreak.status = "broken";
				notificationTrigger = "attentionRequired";
			} /*if (hoursSinceLastLogin >= 72)*/ else {
				loginStreak.count = 1;
				loginStreak.status = "active";
				notificationTrigger = "reset";
			}

			await tx.gamificationProfile.update({
				where: { userId: user.id },
				data: {
					lastLogin: now,
					loginStreak
				}
			});
			notificationStreakValue = loginStreak;
		}
		await createNotification({
			tx,
			component: "StreakInfoDialog",
			props: {
				flames: notificationFlames,
				trigger: notificationTrigger,
				loginStreak: notificationStreakValue
			},
			targetAudience: "user",
			targetUser: user.id
		});
	});
}

export const loginCallbacks: SigninCallback[] = [logLogin, updateLoginStreak];
