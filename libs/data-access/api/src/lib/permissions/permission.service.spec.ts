import { database } from "@self-learning/database";
import { AccessLevel, GroupRole } from "@prisma/client";

jest.mock("@self-learning/database", () => ({
	__esModule: true,
	database: {
		permission: {
			findMany: jest.fn(),
			create: jest.fn()
		},
		member: {
			create: jest.fn(),
			findFirst: jest.fn()
		},
		group: {
			findUnique: jest.fn()
		}
	}
}));

import {
	createResourceAccess,
	getResourceAccess,
	hasResourcesAccess,
	hasResourceAccess,
	createGroupAccess,
	getGroupRole,
	hasGroupRole,
	getGroup
} from "./permission.service";

describe("permission.service", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("createResourceAccess", () => {
		it("creates resource access", async () => {
			(database.permission.create as jest.Mock).mockResolvedValue({
				id: "nothing to test here really"
			});

			const res = await createResourceAccess({
				groupId: 1,
				courseId: "c1",
				accessLevel: AccessLevel.EDIT
			});

			expect(res).toEqual({ id: "nothing to test here really" });
		});
	});

	describe("getResourceAccess", () => {
		it("returns the best access level and groupId", async () => {
			(database.permission.findMany as jest.Mock).mockResolvedValue([
				{ accessLevel: AccessLevel.VIEW, groupId: 1 },
				{ accessLevel: AccessLevel.FULL, groupId: 2 }
			]);

			const res = await getResourceAccess({ userId: "u1", courseId: "c1" });

			expect(res).toEqual({ accessLevel: AccessLevel.FULL, groupId: 2 });
		});

		it("returns null access level and groupId when user has no permissions", async () => {
			(database.permission.findMany as jest.Mock).mockResolvedValue([]);

			const res = await getResourceAccess({ userId: "u1", courseId: "c1" });

			expect(res).toEqual({ accessLevel: null, groupId: null });
		});
	});

	describe("hasResourcesAccess", () => {
		it("returns true when user has required access for all resources", async () => {
			(database.permission.findMany as jest.Mock).mockResolvedValue([
				{ accessLevel: AccessLevel.FULL, courseId: "c1" },
				{ accessLevel: AccessLevel.EDIT, lessonId: "l1" }
			]);

			const checks = [
				{ courseId: "c1", accessLevel: AccessLevel.VIEW },
				{ lessonId: "l1", accessLevel: AccessLevel.EDIT }
			];

			const ok = await hasResourcesAccess("u1", checks);
			expect(ok).toBe(true);
		});

		it("returns false when user has at least one requirement not met", async () => {
			(database.permission.findMany as jest.Mock).mockResolvedValue([
				{ accessLevel: AccessLevel.VIEW, courseId: "c1" },
				{ accessLevel: AccessLevel.EDIT, courseId: "c1" }
			]);

			const checks = [{ courseId: "c1", accessLevel: AccessLevel.FULL }];

			const ok = await hasResourcesAccess("u1", checks);
			expect(ok).toBe(false);
		});

		it("should not mix courses and lessons", async () => {
			(database.permission.findMany as jest.Mock).mockResolvedValue([
				{ accessLevel: AccessLevel.VIEW, courseId: "c1" },
				{ accessLevel: AccessLevel.EDIT, lessonId: "c1" }
			]);

			const checks = [{ courseId: "c1", accessLevel: AccessLevel.EDIT }];
			const res = await hasResourcesAccess("u1", checks);

			expect(res).toEqual(false);
		});
	});

	describe("hasResourceAccess", () => {
		it("returns true when user's actual level meets required level", async () => {
			(database.permission.findMany as jest.Mock).mockResolvedValue([
				{ accessLevel: AccessLevel.FULL, groupId: 1 }
			]);

			const ok = await hasResourceAccess({
				userId: "u1",
				courseId: "c1",
				accessLevel: AccessLevel.FULL
			});
			expect(ok).toBe(true);
		});

		it("returns true when user's level higher than required level", async () => {
			(database.permission.findMany as jest.Mock).mockResolvedValue([
				{ accessLevel: AccessLevel.FULL, groupId: 1 }
			]);

			const ok = await hasResourceAccess({
				userId: "u1",
				courseId: "c1",
				accessLevel: AccessLevel.EDIT
			});
			expect(ok).toBe(true);
		});

		it("returns false when user's level lower than required level", async () => {
			(database.permission.findMany as jest.Mock).mockResolvedValue([
				{ accessLevel: AccessLevel.VIEW, groupId: 1 }
			]);

			const ok = await hasResourceAccess({
				userId: "u1",
				courseId: "c1",
				accessLevel: AccessLevel.EDIT
			});
			expect(ok).toBe(false);
		});

		it("returns false when user has no access", async () => {
			(database.permission.findMany as jest.Mock).mockResolvedValue([]);

			const ok = await hasResourceAccess({
				userId: "u1",
				courseId: "c1",
				accessLevel: AccessLevel.VIEW
			});
			expect(ok).toBe(false);
		});
	});

	describe("createGroupAccess", () => {
		it("creates membership with expiresAt when duration provided", async () => {
			(database.member.create as jest.Mock).mockResolvedValue({ id: 1 });

			await createGroupAccess(5, "u2", GroupRole.MEMBER, 30);

			expect(database.member.create).toHaveBeenCalledWith({
				data: expect.objectContaining({
					groupId: 5,
					userId: "u2",
					role: GroupRole.MEMBER,
					expiresAt: expect.any(Date)
				})
			});
		});

		it("creates membership with null expiresAt when duration omitted", async () => {
			(database.member.create as jest.Mock).mockResolvedValue({ id: 2 });

			await createGroupAccess(6, "u3", GroupRole.ADMIN);

			expect(database.member.create).toHaveBeenCalledWith({
				data: { groupId: 6, userId: "u3", role: GroupRole.ADMIN, expiresAt: null }
			});
		});
	});

	describe("group role helpers", () => {
		it("getGroupRole returns role when membership exists", async () => {
			(database.member.findFirst as jest.Mock).mockResolvedValue({ role: GroupRole.ADMIN });

			const role = await getGroupRole(1, "u1");
			expect(role).toBe(GroupRole.ADMIN);
		});

		it("getGroupRole returns null when no membership", async () => {
			(database.member.findFirst as jest.Mock).mockResolvedValue(null);

			const role = await getGroupRole(1, "u1");
			expect(role).toBeNull();
		});

		it("hasGroupRole returns true when role sufficient", async () => {
			(database.member.findFirst as jest.Mock).mockResolvedValue({ role: GroupRole.ADMIN });

			const ok = await hasGroupRole(1, "u1", GroupRole.MEMBER);
			expect(ok).toBe(true);
		});

		it("hasGroupRole returns false when role insufficient", async () => {
			(database.member.findFirst as jest.Mock).mockResolvedValue({ role: GroupRole.MEMBER });

			const ok = await hasGroupRole(1, "u1", GroupRole.ADMIN);
			expect(ok).toBe(false);
		});

		it("hasGroupRole returns false when user has no role", async () => {
			(database.member.findFirst as jest.Mock).mockResolvedValue(null);

			const ok = await hasGroupRole(1, "u1", GroupRole.ADMIN);
			expect(ok).toBe(false);
		});
	});

	describe("getGroup", () => {
		it("returns group details from database", async () => {
			const group = { id: 7, name: "Group", parent: null, permissions: [], members: [] };
			(database.group.findUnique as jest.Mock).mockResolvedValue(group);

			const res = await getGroup(7);
			expect(res).toEqual(group);
		});
	});
});
