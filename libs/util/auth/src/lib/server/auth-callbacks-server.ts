import { createNewProfile } from "@self-learning/achievements";
import { database } from "@self-learning/database";
import { getExperimentStatus, isExperimentActive } from "@self-learning/profile";
import { GamificationProfile } from "@self-learning/types";
import { createNotification, NotificationPropsMap } from "@self-learning/ui/notifications";
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
	if (!isParticipating) return;

	const now = new Date();

	await database.$transaction(async tx => {
		const profile = await tx.gamificationProfile.findUnique({
			where: { userId: user.id },
			select: { lastLogin: true, loginStreak: true, flames: true }
		});

		if (!profile) {
			const newCreatedProfile = await createNewProfile(username, tx);

			await createNotification({
				tx,
				component: "StreakInfoDialog",
				props: {
					flames: newCreatedProfile.flames,
					trigger: "onBoard",
					loginStreak: newCreatedProfile.loginStreak
				},
				targetAudience: "user",
				targetUser: user.id
			});
			return;
		}

		const { lastLogin, loginStreak, flames } = profile as GamificationProfile;
		const hoursSinceLastLogin = differenceInHours(now, lastLogin ?? new Date());

		if (hoursSinceLastLogin < 24) return;

		let trigger: NotificationPropsMap["StreakInfoDialog"]["trigger"];

		if (hoursSinceLastLogin < 48) {
			loginStreak.count++;
			loginStreak.status = "active";
			trigger = "dailyIncrease";
		} else if (hoursSinceLastLogin < 72) {
			loginStreak.status = "broken";
			trigger = "attentionRequired";
		} else {
			loginStreak.count = 1;
			loginStreak.status = "active";
			trigger = "reset";
		}

		await tx.gamificationProfile.update({
			where: { userId: user.id },
			data: {
				lastLogin: now,
				loginStreak
			}
		});

		await createNotification({
			tx,
			component: "StreakInfoDialog",
			props: {
				flames,
				trigger,
				loginStreak
			},
			targetAudience: "user",
			targetUser: user.id
		});
	});
}

async function createOnboardingNotification({
	user
}: Parameters<SigninCallback>[0]): Promise<void> {
	if (!user.name || !user.id) return;
	const dbUser = await database.user.findUniqueOrThrow({
		where: { id: user.id },
		select: { name: true, id: true, registrationCompleted: true }
	});
	if (dbUser.registrationCompleted) return;

	// TODO [MS-MA]: remove this check when the feature is stable
	let component: keyof NotificationPropsMap = "OnboardingDialog";
	if (isExperimentActive()) {
		component = "ExperimentConsentForwarder";
	}
	await createNotification({
		component,
		props: {},
		targetAudience: "user",
		targetUser: dbUser.id,
		tx: database
	});
}

export const loginCallbacks: SigninCallback[] = [
	logLogin,
	createOnboardingNotification,
	updateLoginStreak
];
