import { AccessLevel } from "@prisma/client";
import { testResourceGuard } from "./guards";
import type { UserFromSession } from "@self-learning/api";

function sessionUser(overrides: Partial<UserFromSession> = {}): UserFromSession {
	return {
		id: "u1",
		name: "user1",
		role: "USER",
		isAuthor: false,
		avatarUrl: null,
		featureFlags: {
			learningDiary: false,
			learningStatistics: false,
			experimental: false
		},
		memberships: [1],
		...overrides
	};
}

describe("testResourceGuard", () => {
	it("allows ADMIN regardless of group permissions", () => {
		expect(
			testResourceGuard(sessionUser({ role: "ADMIN", memberships: [] }), AccessLevel.FULL, [])
		).toBe(true);
	});

	it("allows any user when permittedGroups is undefined", () => {
		expect(testResourceGuard(sessionUser({ memberships: [] }), AccessLevel.EDIT, undefined)).toBe(
			true
		);
	});

	it("denies user without memberships", () => {
		expect(
			testResourceGuard(sessionUser({ memberships: [] }), AccessLevel.EDIT, [
				{ groupId: 1, accessLevel: AccessLevel.FULL }
			])
		).toBe(false);
	});

	it("denies user not in any permitted group", () => {
		expect(
			testResourceGuard(sessionUser({ memberships: [2] }), AccessLevel.EDIT, [
				{ groupId: 1, accessLevel: AccessLevel.FULL }
			])
		).toBe(false);
	});

	it("uses best access level across matching groups", () => {
		expect(
			testResourceGuard(sessionUser({ memberships: [1, 2] }), AccessLevel.EDIT, [
				{ groupId: 1, accessLevel: AccessLevel.VIEW },
				{ groupId: 2, accessLevel: AccessLevel.EDIT }
			])
		).toBe(true);
	});

	it.each([
		[AccessLevel.VIEW, AccessLevel.EDIT, true],
		[AccessLevel.EDIT, AccessLevel.EDIT, true],
		[AccessLevel.FULL, AccessLevel.EDIT, false],
		[AccessLevel.FULL, AccessLevel.FULL, true]
	])(
		"required %s with held %s → %s",
		(required, held, expected) => {
			expect(
				testResourceGuard(sessionUser({ memberships: [1] }), required, [
					{ groupId: 1, accessLevel: held }
				])
			).toBe(expected);
		}
	);
});
