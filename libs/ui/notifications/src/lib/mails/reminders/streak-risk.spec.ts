import { database } from "@self-learning/database";
import "@testing-library/jest-dom";
import { subDays } from "date-fns";
import { SchedulerResult } from "../email-scheduler";
import { sendTemplatedEmail } from "../email-service";
import { checkStreakRisks, getUsersWithStreakRisks } from "./streak-risk";

jest.mock("@self-learning/database", () => ({
	database: {
		user: {
			findMany: jest.fn()
		},
		reminderLog: {
			findFirst: jest.fn(),
			create: jest.fn()
		}
	}
}));

jest.mock("../email-service", () => {
	const actual = jest.requireActual("../email-service");
	return {
		...actual,
		sendTemplatedEmail: jest.fn()
	};
});

const mockCurrentTime = (hour: number) => {
	const fixed = new Date();
	fixed.setUTCHours(hour, 0, 0, 0);
	jest.spyOn(global, "Date").mockImplementation(() => fixed as any);
	return fixed;
};

describe("checkStreakRisks integration", () => {
	let results: SchedulerResult;

	beforeEach(() => {
		jest.clearAllMocks();
		jest.restoreAllMocks();
		results = {
			courseReminders: 0,
			achievementNotifications: 0,
			streakReminders: 0,
			errors: 0
		};
		// Required by sendStreakReminderToUser to build tracking URLs
		if (process.env.NEXT_PUBLIC_SITE_BASE_URL === undefined) {
			process.env.NEXT_PUBLIC_SITE_BASE_URL = "https://example.com";
		}
	});

	it("should send reminders to eligible users at 10:00 UTC", async () => {
		mockCurrentTime(10);
		const yesterday = subDays(new Date(), 1);

		(database.user.findMany as jest.Mock).mockResolvedValue([
			{
				id: "u1",
				email: "test@example.com",
				displayName: "User",
				name: "User",
				enabledLearningStatistics: true,
				acceptedExperimentTerms: true,
				gamificationProfile: {
					lastLogin: yesterday,
					loginStreak: { count: 5, status: "active", pausedUntil: null }
				},
				notificationSettings: [
					{ type: "streakReminderFirst", channel: "email", enabled: true }
				]
			}
		]);
		(database.reminderLog.findFirst as jest.Mock).mockResolvedValue(null);
		(sendTemplatedEmail as jest.Mock).mockResolvedValue({ success: true });
		(database.reminderLog.create as jest.Mock).mockResolvedValue({});

		await checkStreakRisks(results);

		expect(sendTemplatedEmail).toHaveBeenCalledWith(
			"test@example.com",
			expect.objectContaining({
				type: "streakReminderFirst",
				data: expect.objectContaining({
					userName: "User",
					currentStreak: 5
				})
			})
		);
		expect(results.streakReminders).toBe(1);
	});

	it("should not send duplicate reminders", async () => {
		mockCurrentTime(12);
		const yesterday = subDays(new Date(), 1);

		(database.user.findMany as jest.Mock).mockResolvedValue([
			{
				id: "u1",
				email: "test@example.com",
				displayName: "User",
				name: "User",
				enabledLearningStatistics: true,
				acceptedExperimentTerms: true,
				gamificationProfile: {
					lastLogin: yesterday,
					loginStreak: { count: 5, status: "active", pausedUntil: null }
				},
				notificationSettings: [
					{ type: "streakReminderFirst", channel: "email", enabled: true }
				]
			}
		]);
		(database.reminderLog.findFirst as jest.Mock).mockResolvedValue({
			templateKey: "streakReminderFirst",
			status: "SENT",
			sentAt: new Date()
		});

		await checkStreakRisks(results);
		expect(sendTemplatedEmail).not.toHaveBeenCalled();
		expect(results.streakReminders).toBe(0);
	});
});

describe("getUsersWithStreakRisks", () => {
	it("should return users with active streaks who haven't logged in today", async () => {
		const yesterday = subDays(new Date(), 1);

		(database.user.findMany as jest.Mock).mockResolvedValue([
			{
				id: "u1",
				email: "test@example.com",
				displayName: "User",
				name: "User",
				acceptedExperimentTerms: true,
				enabledLearningStatistics: true,
				gamificationProfile: {
					lastLogin: yesterday,
					loginStreak: { count: 3, status: "active", pausedUntil: null }
				},
				notificationSettings: [
					{ type: "streakReminderFirst", channel: "email", enabled: true }
				]
			}
		]);

		const users = await getUsersWithStreakRisks("streakReminderFirst");
		expect(users.length).toBe(1);
		expect(users[0].email).toBe("test@example.com");
	});
});
