import { database } from "@self-learning/database";
import { getExperimentStatus, isExperimentActive } from "@self-learning/profile";
import { GamificationProfile } from "@self-learning/types";
import { createNotification, NotificationPropsMap } from "@self-learning/ui/notifications";
import { getDifferenceInGermanDays } from "@self-learning/util/common";
import { createEventLogEntry } from "@self-learning/util/eventlog";
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
 * Calculates the login streak logic based on the given profile and current time.
 * This is a pure function that contains the core business logic without database access.
 */
function calculateLoginStreakUpdate(
	profile: GamificationProfile,
	now: Date
): {
	loginStreak: GamificationProfile["loginStreak"];
	trigger: NotificationPropsMap["StreakInfoDialog"]["trigger"];
	longestStreak?: number;
} {
	const { lastLogin, loginStreak, longestStreak } = profile;

	// Determine reference date: use pausedUntil if status is paused, otherwise lastLogin
	let referenceDate: Date | undefined;
	if (loginStreak.status === "paused") {
		referenceDate = loginStreak.pausedUntil ?? lastLogin;
	} else {
		referenceDate = lastLogin;
	}

	// Handle first login case
	if (!referenceDate) {
		return {
			loginStreak: {
				count: 1,
				status: "active",
				pausedUntil: null
			},
			trigger: "reset"
		};
	}

	// Calculate difference in German calendar days (not hours!)
	const daysSinceReference = getDifferenceInGermanDays(now, referenceDate);

	// Create a copy of loginStreak to modify
	const updatedLoginStreak = { ...loginStreak };
	let trigger: NotificationPropsMap["StreakInfoDialog"]["trigger"];
	let newLongestStreak: number | undefined;

	if (loginStreak.status === "broken") {
		updatedLoginStreak.count = 1;
		updatedLoginStreak.status = "active";
		trigger = "reset";
	} else if (daysSinceReference === 1) {
		// A2 & A3: Exactly 1 German day ago (yesterday) - daily increase
		updatedLoginStreak.count = loginStreak.count + 1;
		updatedLoginStreak.status = "active";
		// Keep pausedUntil as is (don't reset to null) for paused streaks
		if (loginStreak.status !== "paused") {
			updatedLoginStreak.pausedUntil = null;
		}
		trigger = "dailyIncrease";

		// Check if we have a new longest streak record
		if (updatedLoginStreak.count > longestStreak) {
			newLongestStreak = updatedLoginStreak.count;
		}
	} else if (daysSinceReference === 2) {
		// A1 & A1.1: Exactly 2 German days ago (day before yesterday) - broken
		updatedLoginStreak.status = "broken";
		updatedLoginStreak.pausedUntil = null;
		// Keep the count unchanged when broken
		trigger = "attentionRequired";
	} else if (daysSinceReference > 2) {
		// A4: More than 2 German days ago - complete reset
		updatedLoginStreak.count = 1;
		updatedLoginStreak.status = "active";
		// Keep pausedUntil as is for paused streaks, reset for others
		if (loginStreak.status !== "paused") {
			updatedLoginStreak.pausedUntil = null;
		}
		trigger = "reset";
	} else {
		// daysSinceReference === 0: Same German day - no change needed
		// This shouldn't normally happen in production, but handle gracefully
		return {
			loginStreak: loginStreak,
			trigger: "dailyIncrease",
			longestStreak: undefined
		};
	}

	return {
		loginStreak: updatedLoginStreak,
		trigger,
		longestStreak: newLongestStreak
	};
}

/**
 * Updates the login streak for a user after successful authentication.
 * Handles database transaction and notification creation.
 */
async function updateLoginStreak({ user }: Parameters<SigninCallback>[0]): Promise<void> {
	const username = user?.name?.trim();
	if (!username || !user.id) return;

	const status = await getExperimentStatus(username);
	if (!status.experimentalFeatures) return;

	const now = new Date();

	await database.$transaction(async tx => {
		const profile = await tx.gamificationProfile.findUniqueOrThrow({
			where: { userId: user.id },
			select: {
				lastLogin: true,
				loginStreak: true,
				energy: true,
				longestStreak: true
			}
		});

		const { energy, loginStreak: oldLoginStreak } = profile as GamificationProfile;

		// Calculate the streak update using pure business logic
		const streakUpdate = calculateLoginStreakUpdate(profile as GamificationProfile, now);

		// Prepare update data
		const updateData: {
			lastLogin: Date;
			loginStreak: GamificationProfile["loginStreak"];
			longestStreak?: number;
		} = {
			lastLogin: now,
			loginStreak: streakUpdate.loginStreak
		};

		// Only update longestStreak if we have a new record
		if (streakUpdate.longestStreak !== undefined) {
			updateData.longestStreak = streakUpdate.longestStreak;
		}

		// Update the profile in database
		await tx.gamificationProfile.update({
			where: { userId: user.id },
			data: updateData
		});

		if (streakUpdate.loginStreak.count !== oldLoginStreak.count) {
			// Create notification with the calculated trigger
			await createNotification({
				tx,
				component: "StreakInfoDialog",
				props: {
					energy: energy,
					trigger: streakUpdate.trigger,
					loginStreak: streakUpdate.loginStreak
				},
				targetAudience: "user",
				targetUserIds: user.id
			});
		}
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
		targetUserIds: dbUser.id,
		tx: database
	});
}

// Export function for testing
export { calculateLoginStreakUpdate, updateLoginStreak };

export const loginCallbacks: SigninCallback[] = [
	logLogin,
	createOnboardingNotification,
	updateLoginStreak
];
