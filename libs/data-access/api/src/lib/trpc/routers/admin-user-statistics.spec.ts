import { adminRouter } from "./admin.router";
import { t } from "../trpc";
import type { Context } from "../context";
import {
	getSignInStatistics,
	getEstimatedRegistrationHistory
} from "@self-learning/database/server";

jest.mock("@self-learning/database/server", () => ({
	GroupRole: { ADMIN: "ADMIN" },
	database: {},
	getSignInStatistics: jest.fn(),
	getEstimatedRegistrationHistory: jest.fn()
}));
jest.mock("@self-learning/admin", () => ({}));

const user = {
	id: "user-id",
	name: "user",
	role: "USER" as const,
	isAuthor: false,
	avatarUrl: null,
	memberships: [],
	featureFlags: { learningDiary: false, learningStatistics: false, experimental: false }
};

describe("administrator user statistics", () => {
	it("rejects unauthenticated and non-administrator requests", async () => {
		const anonymous = t.createCallerFactory(adminRouter)({} as Context);
		const regular = t.createCallerFactory(adminRouter)({ user });
		await expect(anonymous.userStatistics()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
		await expect(regular.userStatistics()).rejects.toMatchObject({ code: "FORBIDDEN" });
		await expect(anonymous.registrationHistory()).rejects.toMatchObject({
			code: "UNAUTHORIZED"
		});
		await expect(regular.registrationHistory()).rejects.toMatchObject({ code: "FORBIDDEN" });
		expect(getEstimatedRegistrationHistory).not.toHaveBeenCalled();
		expect(getSignInStatistics).not.toHaveBeenCalled();
	});

	it("returns registration history to administrators", async () => {
		const history = [{ month: "2026-01", total: 1 }];
		jest.mocked(getEstimatedRegistrationHistory).mockResolvedValue(history);
		const caller = t.createCallerFactory(adminRouter)({ user: { ...user, role: "ADMIN" } });
		await expect(caller.registrationHistory()).resolves.toEqual(history);
	});

	it("returns aggregates to administrators", async () => {
		const result = {
			today: 1,
			semester: 2,
			year: 3,
			total: 4,
			registrationHistory: [{ month: "2026-01", total: 4 }],
			trackingStartedAt: new Date()
		};
		jest.mocked(getSignInStatistics).mockResolvedValue(result);
		const caller = t.createCallerFactory(adminRouter)({ user: { ...user, role: "ADMIN" } });
		await expect(caller.userStatistics()).resolves.toEqual(result);
	});
});
