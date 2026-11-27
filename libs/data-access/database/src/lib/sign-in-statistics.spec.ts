import {
	berlinCalendarDay,
	getSignInStatistics,
	recordDailySignIn,
	signInPeriodStarts
} from "./sign-in-statistics";
import { database } from "./prisma";

jest.mock("./prisma", () => ({
	database: {
		dailySignIn: { upsert: jest.fn() },
		user: { count: jest.fn() },
		signInTracking: { findUniqueOrThrow: jest.fn() },
		$queryRaw: jest.fn()
	}
}));

describe("sign-in statistics", () => {
	it.each([
		["2026-03-31T21:59:59Z", "2026-03-31", "2025-10-01", "2026-01-01"],
		["2026-03-31T22:00:00Z", "2026-04-01", "2026-04-01", "2026-01-01"],
		["2026-09-30T22:00:00Z", "2026-10-01", "2026-10-01", "2026-01-01"],
		["2026-12-31T23:00:00Z", "2027-01-01", "2026-10-01", "2027-01-01"],
		["2026-10-25T00:30:00Z", "2026-10-25", "2026-10-01", "2026-01-01"],
		["2026-10-25T01:30:00Z", "2026-10-25", "2026-10-01", "2026-01-01"]
	])("calculates Berlin boundaries at %s", (instant, day, semester, year) => {
		// Setup
		const now = new Date(instant);

		// Exercise
		const starts = signInPeriodStarts(now);

		// Verify
		expect(starts.today.toISOString().slice(0, 10)).toBe(day);
		expect(starts.semester.toISOString().slice(0, 10)).toBe(semester);
		expect(starts.year.toISOString().slice(0, 10)).toBe(year);
	});

	it("uses the same daily key for repeated sign-ins", async () => {
		// Setup
		const firstSignIn = new Date("2026-04-01T08:00:00Z");
		const secondSignIn = new Date("2026-04-01T18:00:00Z");

		// Exercise
		await recordDailySignIn("user-1", firstSignIn);
		await recordDailySignIn("user-1", secondSignIn);

		// Verify
		const day = berlinCalendarDay(firstSignIn);
		expect(database.dailySignIn.upsert).toHaveBeenCalledTimes(2);
		expect(database.dailySignIn.upsert).toHaveBeenNthCalledWith(1, {
			where: { userId_day: { userId: "user-1", day } },
			create: { userId: "user-1", day },
			update: {}
		});
		expect(database.dailySignIn.upsert).toHaveBeenNthCalledWith(2, {
			where: { userId_day: { userId: "user-1", day } },
			create: { userId: "user-1", day },
			update: {}
		});
	});

	it("uses the same registration history for the total and chart", async () => {
		// Setup
		const history = [
			{ month: "2026-03", total: 2 },
			{ month: "2026-04", total: 4 }
		];
		jest.mocked(database.$queryRaw)
			.mockResolvedValueOnce([{ today: 1, semester: 2, year: 3 }])
			.mockResolvedValueOnce(history);
		const startedAt = new Date("2026-01-01T00:00:00Z");
		jest.mocked(database.signInTracking.findUniqueOrThrow).mockResolvedValue({
			id: 1,
			startedAt
		});

		// Exercise
		const result = getSignInStatistics(new Date("2026-04-01T08:00:00Z"));

		// Verify
		await expect(result).resolves.toEqual({
			today: 1,
			semester: 2,
			year: 3,
			total: 4,
			registrationHistory: history,
			trackingStartedAt: startedAt
		});
		expect(database.user.count).not.toHaveBeenCalled();
	});
});
