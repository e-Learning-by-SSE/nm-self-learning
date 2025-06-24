import { database } from "@self-learning/database";
import { LoginStreak } from "@self-learning/types";
import { endOfDay, startOfDay } from "date-fns";
import { SchedulerResult } from "../email-scheduler";
import { isEmailNotificationSettingEnabled, sendTemplatedEmail } from "../email-service";

/**
 * Domain Model: StreakRisk
 * Represents a user whose login streak is in danger of being lost
 *
 * Think of this like a fire alarm system - we detect when a "streak fire"
 * might go out (user hasn't logged in today) and send reminders to keep it burning
 */
interface StreakRisk {
	userId: string;
	email: string;
	displayName: string;
	name: string;
	currentStreak: number;
	lastLogin: Date;
	hasLoggedInToday: boolean;
}

interface ReminderSchedule {
	timeUTC: number; // Hour in UTC (0-23)
	templateKey: "streakReminderFirst" | "streakReminderLast";
}

const REMINDER_SCHEDULES: ReminderSchedule[] = [
	{
		timeUTC: 10,
		templateKey: "streakReminderFirst"
	},
	{
		timeUTC: 18,
		templateKey: "streakReminderLast"
	}
];

export async function checkStreakRisks(results: SchedulerResult): Promise<void> {
	const currentHour = new Date().getUTCHours();

	// Find which reminder schedule applies to current time
	const currentSchedule = REMINDER_SCHEDULES.find(schedule => schedule.timeUTC === currentHour);
	if (!currentSchedule) {
		// Not a reminder time, nothing to do
		return;
	}

	// Step 1: Get all users with streak risks
	const usersAtRisk = await getUsersWithStreakRisks(currentSchedule.templateKey);

	// Step 2: Filter users who haven't received this specific reminder yet
	const usersNeedingReminder = await filterUsersWithoutReminder(
		usersAtRisk,
		currentSchedule.templateKey
	);

	// Step 3: Send reminders and log them
	for (const user of usersNeedingReminder) {
		await sendStreakReminderToUser(user, currentSchedule, results);
	}
}

/**
 * Domain Logic: Identify users whose streaks are at risk
 *
 * A streak is at risk when:
 * 1. User has an active loginStreak > 0
 * 2. User hasn't logged in today
 * 3. User has email notifications enabled
 */
// export for testing
export async function getUsersWithStreakRisks(
	emailNotificationKey: "streakReminderLast" | "streakReminderFirst"
): Promise<StreakRisk[]> {
	const today = new Date();
	const startOfToday = startOfDay(today);
	const endOfToday = endOfDay(today);

	// Get all users with active streaks and their login status for today
	const usersWithStreaks = await database.user.findMany({
		where: {
			email: { not: null },
			gamificationProfile: {
				isNot: null
			},
			featureFlags: {
				experimental: true
			},
			acceptedExperimentTerms: {
				not: null
			}
		},
		include: {
			gamificationProfile: true,
			notificationSettings: {
				where: {
					type: emailNotificationKey,
					channel: "email",
					enabled: true
				}
			}
		}
	});

	// Transform and filter users at risk
	const usersAtRisk: StreakRisk[] = [];

	for (const user of usersWithStreaks) {
		if (!user.gamificationProfile || !user.email) continue;

		// Check if user has email notifications enabled for streak reminders
		if (!isEmailNotificationSettingEnabled(emailNotificationKey, user)) continue;

		const loginStreak = user.gamificationProfile.loginStreak as unknown as LoginStreak;

		// Skip if no active streak
		if (!loginStreak || loginStreak.count <= 0 || loginStreak.status !== "active") {
			continue;
		}

		// Check if user has logged in today by looking at their last login
		const lastLogin = user.gamificationProfile.lastLogin;
		const hasLoggedInToday = lastLogin >= startOfToday && lastLogin <= endOfToday;

		// Only include users who haven't logged in today (streak at risk)
		if (!hasLoggedInToday) {
			usersAtRisk.push({
				userId: user.id,
				email: user.email,
				name: user.name,
				displayName: user.displayName || "Lernender",
				currentStreak: loginStreak.count,
				lastLogin: lastLogin,
				hasLoggedInToday: false
			});
		}
	}

	return usersAtRisk;
}

/**
 * Filter users who haven't received the specific reminder today
 */
async function filterUsersWithoutReminder(
	users: StreakRisk[],
	templateKey: string
): Promise<StreakRisk[]> {
	const today = new Date();
	const startOfToday = startOfDay(today);

	const usersNeedingReminder: StreakRisk[] = [];

	for (const user of users) {
		// Check if this specific reminder has already been sent today
		const existingReminder = await database.reminderLog.findFirst({
			where: {
				userId: user.userId,
				templateKey: templateKey,
				status: "SENT",
				sentAt: {
					gte: startOfToday
				}
			}
		});

		if (!existingReminder) {
			usersNeedingReminder.push(user);
		}
	}

	return usersNeedingReminder;
}

/**
 * Send reminder email to a user and log the action
 */
export async function sendStreakReminderToUser(
	user: StreakRisk,
	schedule: ReminderSchedule,
	results: SchedulerResult
): Promise<void> {
	try {
		// Prepare email context
		const emailResult = await sendTemplatedEmail(user.email, {
			type: schedule.templateKey,
			data: {
				userName: user.displayName,
				currentStreak: user.currentStreak,
				loginUrl: `${process.env.NEXT_PUBLIC_SITE_BASE_URL}/profile`
			}
		});

		if (emailResult.success) {
			results.streakReminders++;

			// Log the successful reminder
			await database.reminderLog.create({
				data: {
					userId: user.userId,
					templateKey: schedule.templateKey,
					status: "SENT",
					sentAt: new Date(),
					metadata: {
						streakCount: user.currentStreak,
						scheduledHour: schedule.timeUTC
					}
				}
			});

			console.debug(
				`Streak reminder sent to user ${user.displayName} (streak: ${user.currentStreak})`
			);
		} else {
			results.errors++;

			// Log the failed reminder
			await database.reminderLog.create({
				data: {
					userId: user.userId,
					templateKey: schedule.templateKey,
					status: "FAILED",
					error: emailResult.error || "Unknown email error",
					metadata: {
						streakCount: user.currentStreak
					}
				}
			});
		}
	} catch (error) {
		console.error(`Failed to send streak reminder to user ${user.userId}:`, error);
		results.errors++;

		// Log the error
		try {
			await database.reminderLog.create({
				data: {
					userId: user.userId,
					templateKey: schedule.templateKey,
					status: "FAILED",
					error: error instanceof Error ? error.message : "Unknown error",
					metadata: {
						streakCount: user.currentStreak
					}
				}
			});
		} catch (logError) {
			console.error("Failed to log reminder error:", logError);
		}
	}
}
