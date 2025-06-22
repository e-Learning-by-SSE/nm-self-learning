import { database } from "@self-learning/database";
import { getExperimentStatus, isExperimentActive } from "@self-learning/profile";
import { GamificationProfile } from "@self-learning/types";
import { createNotification, NotificationPropsMap } from "@self-learning/ui/notifications";
import { createEventLogEntry } from "@self-learning/util/eventlog";
import { differenceInHours, isBefore } from "date-fns";
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
// exported for testing
export async function updateLoginStreak({ user }: Parameters<SigninCallback>[0]): Promise<void> {
	const username = user?.name?.trim();
	if (!username) return;

	const status = await getExperimentStatus(username);
	if (!status.experimentalFeatures) return;
	const now = new Date();

	await database.$transaction(async tx => {
		console.log("Debug, 1");
		const profile = await tx.gamificationProfile.findUniqueOrThrow({
			where: { userId: user.id },
			select: { lastLogin: true, loginStreak: true, flames: true, longestStreak: true }
		});
		console.log("Debug, 2");
		const { lastLogin, loginStreak, flames } = profile as GamificationProfile;
		let lastActivity: Date | undefined;
		if (loginStreak.status === "paused") {
			lastActivity = loginStreak.pausedUntil ?? profile.lastLogin;
		} else {
			lastActivity = lastLogin;
		}

		console.log(`Debug ${username} (${lastActivity})`);
		const hoursSinceLastLogin = differenceInHours(now, lastActivity ?? new Date());
		console.log(`Debug hoursSinceLastLogin ${username} (${hoursSinceLastLogin})`);

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

		let longestStreak: number | undefined;
		if (loginStreak.count > profile.longestStreak) {
			longestStreak = loginStreak.count;
		}

		console.log(
			`User ${username} ${user.id} logged in after ${hoursSinceLastLogin} hours. Updating streak: ` +
				`count=${loginStreak.count}, status=${loginStreak.status}, longestStreak=${longestStreak}`
		);

		await tx.gamificationProfile.update({
			where: { userId: user.id },
			data: {
				lastLogin: now,
				loginStreak: loginStreak,
				longestStreak: longestStreak
			}
		});

		console.log("done");
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
