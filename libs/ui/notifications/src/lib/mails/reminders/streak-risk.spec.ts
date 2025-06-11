import "@testing-library/jest-dom";
import { database } from "@self-learning/database";
import { addDays, subDays } from "date-fns";
import { SchedulerResult } from "../email-scheduler";
import { sendStreakReminder } from "../email-service";
import { checkStreakRisks, getUsersWithStreakRisks } from "./streak-risk";

// Mock dependencies
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
		sendStreakReminder: jest.fn() // nur diese Methode mocken
	};
});

// Mock current time to control test scenarios
const mockCurrentTime = (hour: number) => {
	const mockDate = new Date();
	mockDate.setUTCHours(hour, 0, 0, 0);
	jest.spyOn(global, "Date").mockImplementation(() => mockDate);
	return mockDate;
};

describe("checkStreakRisks", () => {
	let results: SchedulerResult;

	beforeEach(() => {
		results = {
			courseReminders: 0,
			achievementNotifications: 0,
			streakReminders: 0,
			errors: 0
		};
		jest.clearAllMocks();
		jest.restoreAllMocks();
	});

	describe("Timing Logic", () => {
		it("should do nothing when called outside reminder hours", async () => {
			// Arrange: Set time to 15:00 UTC (not a reminder time)
			mockCurrentTime(15);

			// Act
			await checkStreakRisks(results);

			// Assert: No database calls should be made
			expect(database.user.findMany).not.toHaveBeenCalled();
			expect(results.streakReminders).toBe(0);
		});

		it("should process reminders at 12:00 UTC", async () => {
			// Arrange: Set time to 12:00 UTC (friendly reminder time)
			mockCurrentTime(12);
			(database.user.findMany as jest.Mock).mockResolvedValue([]);

			// Act
			await checkStreakRisks(results);

			// Assert: Should check for users
			expect(database.user.findMany).toHaveBeenCalled();
		});
	});

	describe("User Risk Detection", () => {
		beforeEach(() => {
			mockCurrentTime(12); // Set to reminder time
		});

		it("should identify users with streak at risk", async () => {
			// Arrange: Create test users - one at risk, one safe
			const yesterday = subDays(new Date(), 1);
			const today = new Date();

			const mockUsers = [
				{
					id: "user1",
					email: "atrisk@example.com",
					displayName: "Risk User",
					enabledLearningStatistics: true,
					gamificationProfile: {
						lastLogin: yesterday, // Haven't logged in today
						loginStreak: { count: 5, status: "active", pausedUntil: null }
					},
					notificationSettings: [
						{ type: "streakReminder", channel: "email", enabled: true }
					]
				},
				{
					id: "user2",
					email: "safe@example.com",
					displayName: "Safe User",
					enabledLearningStatistics: true,
					gamificationProfile: {
						lastLogin: today, // Logged in today
						loginStreak: { count: 3, status: "active", pausedUntil: null }
					},
					notificationSettings: [
						{ type: "streakReminder", channel: "email", enabled: true }
					]
				}
			];

			(database.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
			(database.reminderLog.findFirst as jest.Mock).mockResolvedValue(null); // No previous reminders
			(sendStreakReminder as jest.Mock).mockResolvedValue({
				success: true,
				messageId: "test-id"
			});
			(database.reminderLog.create as jest.Mock).mockResolvedValue({});

			// Act
			await checkStreakRisks(results);

			// Assert: Only the at-risk user should get a reminder
			expect(sendStreakReminder).toHaveBeenCalledTimes(1);
			expect(sendStreakReminder).toHaveBeenCalledWith(
				"atrisk@example.com",
				expect.objectContaining({
					userName: "Risk User",
					currentStreak: 5
				})
			);

			expect(results.streakReminders).toBe(1);
		});

		const shouldNotSendConfiguration = [
			{ notificationSettings: [] },
			{ notificationSettings: [{ type: "streakReminder", channel: "email", enabled: false }] }
		];
		it.each(shouldNotSendConfiguration)(
			"should skip users without email notifications enabled",
			async settings => {
				// Arrange: User at risk but notifications disabled
				const yesterday = subDays(new Date(), 1);

				const mockUsers = [
					{
						id: "user1",
						email: "noemail@example.com",
						displayName: "No Email User",
						enabledLearningStatistics: true,
						gamificationProfile: {
							lastLogin: yesterday,
							loginStreak: { count: 7, status: "active", pausedUntil: null }
						},
						...settings
					}
				];

				(database.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

				// Act
				await checkStreakRisks(results);

				// Assert: No reminders should be sent
				expect(sendStreakReminder).not.toHaveBeenCalled();
				expect(results.streakReminders).toBe(0);
			}
		);

		it("should skip users with inactive streaks", async () => {
			// Arrange: User with inactive streak
			const yesterday = subDays(new Date(), 1);

			const mockUsers = [
				{
					id: "user1",
					email: "inactive@example.com",
					displayName: "Inactive Streak User",
					enabledLearningStatistics: true,
					gamificationProfile: {
						lastLogin: yesterday,
						loginStreak: { count: 0, status: "inactive", pausedUntil: null }
					},
					notificationSettings: [
						{ type: "streakReminder", channel: "email", enabled: true }
					]
				}
			];

			(database.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

			// Act
			await checkStreakRisks(results);

			// Assert: No reminders for inactive streaks
			expect(sendStreakReminder).not.toHaveBeenCalled();
			expect(results.streakReminders).toBe(0);
		});
	});

	describe("Duplicate Prevention", () => {
		beforeEach(() => {
			mockCurrentTime(12);
		});

		it("should not send reminder if already sent today", async () => {
			// Arrange: User at risk but already got reminder today
			const yesterday = subDays(new Date(), 1);

			const mockUsers = [
				{
					id: "user1",
					email: "already@example.com",
					displayName: "Already Reminded User",
					enabledLearningStatistics: true,
					gamificationProfile: {
						lastLogin: yesterday,
						loginStreak: { count: 4, status: "active", pausedUntil: null }
					},
					notificationSettings: [
						{ type: "streakReminder", channel: "email", enabled: true }
					]
				}
			];

			(database.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
			(database.reminderLog.findFirst as jest.Mock).mockResolvedValue({
				id: "existing-reminder",
				templateKey: "streak-reminder-12",
				status: "SENT"
			});

			// Act
			await checkStreakRisks(results);

			// Assert: No reminder should be sent
			expect(sendStreakReminder).not.toHaveBeenCalled();
			expect(results.streakReminders).toBe(0);
		});
	});

	describe("Error Handling", () => {
		beforeEach(() => {
			mockCurrentTime(12);
		});

		it("should handle email sending failures gracefully", async () => {
			// Arrange: Email service fails
			const yesterday = subDays(new Date(), 1);

			const mockUsers = [
				{
					id: "user1",
					email: "fail@example.com",
					displayName: "Email Fail User",
					enabledLearningStatistics: true,
					gamificationProfile: {
						lastLogin: yesterday,
						loginStreak: { count: 2, status: "active", pausedUntil: null }
					},
					notificationSettings: [
						{ type: "streakReminder", channel: "email", enabled: true }
					]
				}
			];

			(database.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
			(database.reminderLog.findFirst as jest.Mock).mockResolvedValue(null);
			(sendStreakReminder as jest.Mock).mockResolvedValue({
				success: false,
				error: "SMTP connection failed"
			});
			(database.reminderLog.create as jest.Mock).mockResolvedValue({});

			// Act
			await checkStreakRisks(results);

			// Assert: Error should be tracked
			expect(results.errors).toBe(1);
			expect(database.reminderLog.create).toHaveBeenCalledWith({
				data: expect.objectContaining({
					status: "FAILED",
					error: "SMTP connection failed"
				})
			});
		});

		it("should continue processing other users if one fails", async () => {
			// Arrange: Multiple users, one email fails
			const yesterday = subDays(new Date(), 1);

			const mockUsers = [
				{
					id: "user1",
					email: "fail@example.com",
					displayName: "Fail User",
					enabledLearningStatistics: true,
					gamificationProfile: {
						lastLogin: yesterday,
						loginStreak: { count: 2, status: "active", pausedUntil: null }
					},
					notificationSettings: [
						{ type: "streakReminder", channel: "email", enabled: true }
					]
				},
				{
					id: "user2",
					email: "success@example.com",
					displayName: "Success User",
					enabledLearningStatistics: true,
					gamificationProfile: {
						lastLogin: yesterday,
						loginStreak: { count: 3, status: "active", pausedUntil: null }
					},
					notificationSettings: [
						{ type: "streakReminder", channel: "email", enabled: true }
					]
				}
			];

			(database.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
			(database.reminderLog.findFirst as jest.Mock).mockResolvedValue(null);

			// Mock: First call fails, second succeeds
			(sendStreakReminder as jest.Mock)
				.mockResolvedValueOnce({ success: false, error: "Failed" })
				.mockResolvedValueOnce({ success: true, messageId: "success-id" });
			(database.reminderLog.create as jest.Mock).mockResolvedValue({});

			// Act
			await checkStreakRisks(results);

			// Assert: One success, one error
			expect(results.streakReminders).toBe(1);
			expect(results.errors).toBe(1);
			expect(sendStreakReminder).toHaveBeenCalledTimes(2);
		});
	});

	describe("Different Reminder Types", () => {
		it("should use different template for 21:00 UTC (last chance)", async () => {
			// Arrange: Set time to 21:00 UTC (last chance reminder)
			mockCurrentTime(21);

			const yesterday = subDays(new Date(), 1);
			const mockUsers = [
				{
					id: "user1",
					email: "lastchance@example.com",
					displayName: "Last Chance User",
					enabledLearningStatistics: true,
					gamificationProfile: {
						lastLogin: yesterday,
						loginStreak: { count: 10, status: "active", pausedUntil: null }
					},
					notificationSettings: [
						{ type: "streakReminder", channel: "email", enabled: true }
					]
				}
			];

			(database.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
			(database.reminderLog.findFirst as jest.Mock).mockResolvedValue(null);
			(sendStreakReminder as jest.Mock).mockResolvedValue({ success: true });
			(database.reminderLog.create as jest.Mock).mockResolvedValue({});

			// Act
			await checkStreakRisks(results);

			// Assert: Should use last-chance template key
			expect(database.reminderLog.create).toHaveBeenCalledWith({
				data: expect.objectContaining({
					templateKey: "streak-reminder-21",
					metadata: expect.objectContaining({
						reminderType: "last-chance"
					})
				})
			});
		});
	});
});

describe("getUsersWithStreakRisks", () => {
	it("returns users who have an active streak and haven't logged in today", async () => {
		const yesterday = subDays(new Date(), 1);

		(database.user.findMany as jest.Mock).mockResolvedValue([
			{
				id: "user-1",
				email: "risk@example.com",
				displayName: "Risky",
				enabledLearningStatistics: true,
				gamificationProfile: {
					lastLogin: yesterday,
					loginStreak: { count: 3, status: "active", pausedUntil: null }
				},
				notificationSettings: [{ type: "streakReminder", channel: "email", enabled: true }]
			}
		]);

		const result = await getUsersWithStreakRisks();

		expect(result).toEqual([
			expect.objectContaining({
				userId: "user-1",
				email: "risk@example.com",
				currentStreak: 3,
				hasLoggedInToday: false
			})
		]);
	});

	it("should skip users whose streak is paused (pausedUntil in the future)", async () => {
		const yesterday = subDays(new Date(), 1);
		const tomorrow = addDays(new Date(), 1);

		(database.user.findMany as jest.Mock).mockResolvedValue([
			{
				id: "user-2",
				email: "paused@example.com",
				displayName: "Paused User",
				enabledLearningStatistics: true,
				gamificationProfile: {
					lastLogin: yesterday,
					loginStreak: {
						count: 5,
						status: "paused", // streak is paused
						pausedUntil: tomorrow // streak is paused
					}
				},
				notificationSettings: [{ type: "streakReminder", channel: "email", enabled: true }]
			}
		]);

		const result = await getUsersWithStreakRisks();

		expect(result).toEqual([]); // should not be considered at risk
	});
});
