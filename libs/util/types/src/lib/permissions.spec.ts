import { AccessLevel, GroupRole } from "@prisma/client";
import {
	bestAccessLevel,
	bestGroupRole,
	greaterAccessLevel,
	greaterGroupRole,
	greaterOrEqAccessLevel,
	greaterOrEqGroupRole,
	worstAccessLevel,
	worstGroupRole
} from "./permissions";

describe("access level helpers", () => {
	it("greaterAccessLevel returns true when a is strictly higher", () => {
		expect(greaterAccessLevel(AccessLevel.FULL, AccessLevel.EDIT)).toBe(true);
		expect(greaterAccessLevel(AccessLevel.EDIT, AccessLevel.VIEW)).toBe(true);
		expect(greaterAccessLevel(AccessLevel.VIEW, AccessLevel.FULL)).toBe(false);
		expect(greaterAccessLevel(AccessLevel.EDIT, AccessLevel.EDIT)).toBe(false);
	});

	it("greaterOrEqAccessLevel returns true when a is higher or equal", () => {
		expect(greaterOrEqAccessLevel(AccessLevel.FULL, AccessLevel.EDIT)).toBe(true);
		expect(greaterOrEqAccessLevel(AccessLevel.EDIT, AccessLevel.EDIT)).toBe(true);
		expect(greaterOrEqAccessLevel(AccessLevel.VIEW, AccessLevel.EDIT)).toBe(false);
	});

	it("bestAccessLevel picks the higher level", () => {
		expect(bestAccessLevel(AccessLevel.VIEW, AccessLevel.FULL)).toBe(AccessLevel.FULL);
		expect(bestAccessLevel(AccessLevel.EDIT, AccessLevel.VIEW)).toBe(AccessLevel.EDIT);
	});

	it("worstAccessLevel picks the lower level", () => {
		expect(worstAccessLevel(AccessLevel.VIEW, AccessLevel.FULL)).toBe(AccessLevel.VIEW);
		expect(worstAccessLevel(AccessLevel.EDIT, AccessLevel.FULL)).toBe(AccessLevel.EDIT);
	});
});

describe("group role helpers", () => {
	it("greaterGroupRole returns true when a is strictly higher", () => {
		expect(greaterGroupRole(GroupRole.ADMIN, GroupRole.MEMBER)).toBe(true);
		expect(greaterGroupRole(GroupRole.MEMBER, GroupRole.ADMIN)).toBe(false);
		expect(greaterGroupRole(GroupRole.MEMBER, GroupRole.MEMBER)).toBe(false);
	});

	it("greaterOrEqGroupRole returns true when a is higher or equal", () => {
		expect(greaterOrEqGroupRole(GroupRole.ADMIN, GroupRole.MEMBER)).toBe(true);
		expect(greaterOrEqGroupRole(GroupRole.MEMBER, GroupRole.MEMBER)).toBe(true);
		expect(greaterOrEqGroupRole(GroupRole.MEMBER, GroupRole.ADMIN)).toBe(false);
	});

	it("bestGroupRole picks the higher role", () => {
		expect(bestGroupRole(GroupRole.MEMBER, GroupRole.ADMIN)).toBe(GroupRole.ADMIN);
	});

	it("worstGroupRole picks the lower role", () => {
		expect(worstGroupRole(GroupRole.MEMBER, GroupRole.ADMIN)).toBe(GroupRole.MEMBER);
	});
});
