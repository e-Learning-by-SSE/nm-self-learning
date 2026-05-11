import { database } from "@self-learning/database";
import { AccessLevel, GroupRole } from "@prisma/client";
import { UserFromSession } from "../trpc/context";

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
	hasResourceAccessBatch,
	hasResourceAccess,
	createGroupAccess,
	getGroupRole,
	hasGroupRole,
	getGroup,
	hasEffectiveResourceAccessBatch,
	hasEffectiveResourceAccess,
	hasEffectiveAccess,
	getEffectiveAccess,
	hasEffectiveGroupRole,
	getSingleOwnedResources,
	testGroupCircularParent,
	canCreate,
	canDelete,
	canEdit,
	preparePermissionsForCreate,
	preparePermissionsForUpdate
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
				{ accessLevel: AccessLevel.EDIT, groupId: 1 },
				{ accessLevel: AccessLevel.VIEW, groupId: 2 },
				{ accessLevel: AccessLevel.FULL, groupId: 3 }
			]);

			const res = await getResourceAccess({ userId: "u1", courseId: "c1" });

			expect(res).toEqual({ accessLevel: AccessLevel.FULL, groupId: 3 });
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

			const ok = await hasResourceAccessBatch("u1", checks);
			expect(ok).toBe(true);
		});

		it("returns false when user has at least one requirement not met", async () => {
			(database.permission.findMany as jest.Mock).mockResolvedValue([
				{ accessLevel: AccessLevel.VIEW, courseId: "c1" },
				{ accessLevel: AccessLevel.EDIT, courseId: "c1" }
			]);

			const checks = [{ courseId: "c1", accessLevel: AccessLevel.FULL }];

			const ok = await hasResourceAccessBatch("u1", checks);
			expect(ok).toBe(false);
		});

		it("should not mix courses and lessons", async () => {
			(database.permission.findMany as jest.Mock).mockResolvedValue([
				{ accessLevel: AccessLevel.VIEW, courseId: "c1" },
				{ accessLevel: AccessLevel.EDIT, lessonId: "c1" }
			]);

			const checks = [{ courseId: "c1", accessLevel: AccessLevel.EDIT }];
			const res = await hasResourceAccessBatch("u1", checks);

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

	describe("hasEffectiveResourceAccessBatch", () => {
		it("returns true for ADMIN user regardless of actual permissions", async () => {
			const adminUser = { role: "ADMIN", id: "u1" } as UserFromSession;

			const checks = [
				{ courseId: "c1", accessLevel: AccessLevel.VIEW },
				{ lessonId: "l1", accessLevel: AccessLevel.EDIT }
			];

			const ok = await hasEffectiveResourceAccessBatch(adminUser, checks);
			expect(ok).toBe(true);
			expect(database.permission.findMany).not.toHaveBeenCalled();
		});

		it("calls hasResourceAccessBatch for non-admin users", async () => {
			const user = { role: "USER", id: "u1" } as UserFromSession;
			(database.permission.findMany as jest.Mock).mockResolvedValue([
				{ accessLevel: AccessLevel.FULL, courseId: "c1" }
			]);

			const checks = [{ courseId: "c1", accessLevel: AccessLevel.VIEW }];

			const ok = await hasEffectiveResourceAccessBatch(user, checks);
			expect(ok).toBe(true);
		});
	});

	describe("hasEffectiveResourceAccess", () => {
		it("returns true for ADMIN user regardless of actual permissions", async () => {
			const adminUser = { role: "ADMIN", id: "u1" } as UserFromSession;

			const ok = await hasEffectiveResourceAccess(adminUser, {
				courseId: "c1",
				accessLevel: AccessLevel.FULL
			});
			expect(ok).toBe(true);
			expect(database.permission.findMany).not.toHaveBeenCalled();
		});

		it("calls hasResourceAccess for non-admin users", async () => {
			const user = { role: "USER", id: "u1" } as UserFromSession;
			(database.permission.findMany as jest.Mock).mockResolvedValue([
				{ accessLevel: AccessLevel.FULL, groupId: 1 }
			]);

			const ok = await hasEffectiveResourceAccess(user, {
				courseId: "c1",
				accessLevel: AccessLevel.EDIT
			});
			expect(ok).toBe(true);
		});

		it("returns false for non-admin without sufficient permissions", async () => {
			const user = { role: "USER", id: "u1" } as UserFromSession;
			(database.permission.findMany as jest.Mock).mockResolvedValue([]);

			const ok = await hasEffectiveResourceAccess(user, {
				courseId: "c1",
				accessLevel: AccessLevel.VIEW
			});
			expect(ok).toBe(false);
		});
	});

	describe("hasEffectiveAccess", () => {
		it("returns true for ADMIN users", async () => {
			const adminUser = { role: "ADMIN", id: "u1" } as UserFromSession;

			expect(await hasEffectiveAccess(adminUser, { courseId: "c1" }, AccessLevel.EDIT)).toBe(
				true
			);
		});

		it("returns false for non-admin users without permission", async () => {
			const user = { role: "USER", id: "u2" } as UserFromSession;
			(database.permission.findMany as jest.Mock).mockResolvedValue([]);

			expect(await hasEffectiveAccess(user, { lessonId: "l1" }, AccessLevel.VIEW)).toBe(
				false
			);
		});

		it("returns true for non-admin users with sufficient permission", async () => {
			const user = { role: "USER", id: "u2" } as UserFromSession;
			(database.permission.findMany as jest.Mock).mockResolvedValue([
				{ accessLevel: AccessLevel.FULL, groupId: 5 }
			]);

			expect(await hasEffectiveAccess(user, { lessonId: "l1" }, AccessLevel.EDIT)).toBe(true);
		});
	});

	describe("getEffectiveAccess", () => {
		it("returns FULL access level with null groupId for ADMIN user", async () => {
			const adminUser = { role: "ADMIN", id: "u1" } as UserFromSession;

			const res = await getEffectiveAccess(adminUser, { courseId: "c1" });
			expect(res).toEqual({ accessLevel: AccessLevel.FULL, groupId: null });
			expect(database.permission.findMany).not.toHaveBeenCalled();
		});

		it("calls getResourceAccess for non-admin users using lessonId", async () => {
			const user = { role: "USER", id: "u1" } as UserFromSession;
			(database.permission.findMany as jest.Mock).mockResolvedValue([
				{ accessLevel: AccessLevel.EDIT, groupId: 9 }
			]);

			const res = await getEffectiveAccess(user, { lessonId: "l1" });
			expect(res).toEqual({ accessLevel: AccessLevel.EDIT, groupId: 9 });
		});
	});

	describe("canCreate, canEdit and canDelete", () => {
		it("returns true for ADMIN users on edit and delete", async () => {
			const adminUser = { role: "ADMIN", id: "u1" } as UserFromSession;

			expect(await canCreate(adminUser)).toBe(true);
			expect(await canEdit(adminUser, { courseId: "c1" })).toBe(true);
			expect(await canDelete(adminUser, { courseId: "c1" })).toBe(true);
		});

		it("returns true when a non-admin user is a member", async () => {
			const user = { role: "USER", id: "u2" } as UserFromSession;
			(database.member.findFirst as jest.Mock).mockResolvedValue({ userId: "u2" });

			expect(await canCreate(user)).toBe(true);
		});

		it("returns false when a non-admin user is not a member", async () => {
			const user = { role: "USER", id: "u2" } as UserFromSession;
			(database.member.findFirst as jest.Mock).mockResolvedValue(null);

			expect(await canCreate(user)).toBe(false);
		});
	});

	describe("preparePermissionsForCreate", () => {
		it("returns create input when at least one FULL permission exists", async () => {
			const result = await preparePermissionsForCreate([
				{ groupId: 1, accessLevel: AccessLevel.FULL },
				{ groupId: 2, accessLevel: AccessLevel.VIEW }
			]);

			expect(result).toEqual({
				create: [
					{ groupId: 1, accessLevel: AccessLevel.FULL },
					{ groupId: 2, accessLevel: AccessLevel.VIEW }
				]
			});
		});

		it("throws FORBIDDEN when no FULL permission is provided", async () => {
			await expect(
				preparePermissionsForCreate([
					{ groupId: 1, accessLevel: AccessLevel.VIEW },
					{ groupId: 2, accessLevel: AccessLevel.EDIT }
				])
			).rejects.toMatchObject({ code: "FORBIDDEN" });
		});
	});

	describe("preparePermissionsForUpdate", () => {
		it("returns undefined when permissions did not change", async () => {
			(database.permission.findMany as jest.Mock).mockResolvedValue([
				{ groupId: 1, accessLevel: AccessLevel.FULL }
			]);

			const result = await preparePermissionsForUpdate({ courseId: "c1" }, [
				{ groupId: 1, accessLevel: AccessLevel.FULL }
			]);

			expect(result).toBeUndefined();
		});

		it("returns update payload when permissions differ", async () => {
			(database.permission.findMany as jest.Mock).mockResolvedValue([
				{ groupId: 1, accessLevel: AccessLevel.VIEW }
			]);

			const result = await preparePermissionsForUpdate({ courseId: "c1" }, [
				{ groupId: 1, accessLevel: AccessLevel.FULL },
				{ groupId: 2, accessLevel: AccessLevel.VIEW }
			]);

			expect(result).toEqual({
				deleteMany: { groupId: { notIn: [1, 2] } },
				upsert: [
					{
						where: {
							groupId_courseId: { groupId: 1, courseId: "c1" }
						},
						create: { groupId: 1, accessLevel: AccessLevel.FULL },
						update: { accessLevel: AccessLevel.FULL }
					},
					{
						where: {
							groupId_courseId: { groupId: 2, courseId: "c1" }
						},
						create: { groupId: 2, accessLevel: AccessLevel.VIEW },
						update: { accessLevel: AccessLevel.VIEW }
					}
				]
			});
		});

		it("throws BAD_REQUEST when resource input is invalid", async () => {
			await expect(
				preparePermissionsForUpdate({} as any, [
					{ groupId: 1, accessLevel: AccessLevel.FULL }
				])
			).rejects.toMatchObject({ code: "BAD_REQUEST" });
		});

		it("throws BAD_REQUEST resource input is invalid", async () => {
			await expect(
				preparePermissionsForUpdate({} as any, [
					{ groupId: 1, accessLevel: AccessLevel.VIEW }
				])
			).rejects.toMatchObject({ code: "BAD_REQUEST" });
		});

		it("throws BAD_REQUEST when no FULL permission is provided", async () => {
			await expect(
				preparePermissionsForUpdate({ courseId: "c1" }, [
					{ groupId: 1, accessLevel: AccessLevel.VIEW }
				])
			).rejects.toMatchObject({ code: "BAD_REQUEST" });
		});

		it("returns update payload when resource.lessonId is provided", async () => {
			(database.permission.findMany as jest.Mock).mockResolvedValue([
				{ groupId: 1, accessLevel: AccessLevel.VIEW }
			]);

			const result = await preparePermissionsForUpdate({ lessonId: "l1" }, [
				{ groupId: 1, accessLevel: AccessLevel.FULL }
			]);

			expect(result).toEqual({
				deleteMany: { groupId: { notIn: [1] } },
				upsert: [
					{
						where: {
							groupId_lessonId: { groupId: 1, lessonId: "l1" }
						},
						create: { groupId: 1, accessLevel: AccessLevel.FULL },
						update: { accessLevel: AccessLevel.FULL }
					}
				]
			});
		});
	});

	describe("hasEffectiveGroupRole", () => {
		it("returns true for ADMIN user regardless of group membership", async () => {
			const adminUser = { role: "ADMIN", id: "u1" } as UserFromSession;

			const ok = await hasEffectiveGroupRole(adminUser, 5, GroupRole.MEMBER);
			expect(ok).toBe(true);
			expect(database.member.findFirst).not.toHaveBeenCalled();
		});

		it("calls hasGroupRole for non-admin users", async () => {
			const user = { role: "USER", id: "u1" } as UserFromSession;
			(database.member.findFirst as jest.Mock).mockResolvedValue({ role: GroupRole.ADMIN });

			const ok = await hasEffectiveGroupRole(user, 5, GroupRole.MEMBER);
			expect(ok).toBe(true);
		});

		it("returns false for non-admin without sufficient role", async () => {
			const user = { role: "USER", id: "u1" } as UserFromSession;
			(database.member.findFirst as jest.Mock).mockResolvedValue({ role: GroupRole.MEMBER });

			const ok = await hasEffectiveGroupRole(user, 5, GroupRole.ADMIN);
			expect(ok).toBe(false);
		});

		it("returns false for non-admin with no group membership", async () => {
			const user = { role: "USER", id: "u1" } as UserFromSession;
			(database.member.findFirst as jest.Mock).mockResolvedValue(null);

			const ok = await hasEffectiveGroupRole(user, 5, GroupRole.ADMIN);
			expect(ok).toBe(false);
		});
	});

	describe("getSingleOwnedResources", () => {
		it("returns resources FULL owned by the group", async () => {
			const mockResult = [
				{ course: { title: "Course 1", courseId: "c1" }, lesson: null },
				{ course: null, lesson: { title: "Lesson 1", lessonId: "l1" } }
			];
			(database.permission.findMany as jest.Mock).mockResolvedValue(mockResult);

			const result = await getSingleOwnedResources(1);

			expect(database.permission.findMany).toHaveBeenCalledWith({
				where: {
					groupId: 1,
					accessLevel: AccessLevel.FULL,
					OR: [
						{
							course: {
								permissions: {
									none: { accessLevel: AccessLevel.FULL, NOT: { groupId: 1 } }
								}
							}
						},
						{
							lesson: {
								permissions: {
									none: { accessLevel: AccessLevel.FULL, NOT: { groupId: 1 } }
								}
							}
						}
					]
				},
				select: {
					course: { select: { title: true, courseId: true } },
					lesson: { select: { title: true, lessonId: true } }
				}
			});
			expect(result).toEqual(mockResult);
		});

		it("returns empty array when no owned resources", async () => {
			(database.permission.findMany as jest.Mock).mockResolvedValue([]);

			const result = await getSingleOwnedResources(1);

			expect(result).toEqual([]);
		});
	});

	describe("testGroupCircularParent", () => {
		it("returns true immediately if groupId equals parentId", async () => {
			const result = await testGroupCircularParent(1, 1);
			expect(result).toBe(true);
		});

		it("returns false when parent chain exists with no cycle", async () => {
			// Mock database to return a simple chain: 2 -> 3 -> null
			(database.group.findUnique as jest.Mock)
				.mockResolvedValueOnce({ parentId: 3 }) // parent of 2
				.mockResolvedValueOnce({ parentId: null }); // parent of 3

			const result = await testGroupCircularParent(1, 2);
			expect(result).toBe(false);

			expect(database.group.findUnique).toHaveBeenCalledTimes(2);
			expect(database.group.findUnique).toHaveBeenCalledWith({
				where: { id: 2 },
				select: { parentId: true }
			});
			expect(database.group.findUnique).toHaveBeenCalledWith({
				where: { id: 3 },
				select: { parentId: true }
			});
		});

		it("returns true when a circular parent is detected", async () => {
			// Mock database to return circular chain: 1 -> 2 -> 3 -> 1
			(database.group.findUnique as jest.Mock)
				.mockResolvedValueOnce({ parentId: 3 }) // parent of 2
				.mockResolvedValueOnce({ parentId: 1 }); // parent of 3

			const result = await testGroupCircularParent(1, 2);
			expect(result).toBe(true);
			expect(database.group.findUnique).toHaveBeenCalledTimes(2);
		});

		it("handles non-existent parent gracefully", async () => {
			// parentId 2 returns null in DB → stops chain
			(database.group.findUnique as jest.Mock).mockResolvedValueOnce(null);

			const result = await testGroupCircularParent(1, 2);
			expect(result).toBe(false);
			expect(database.group.findUnique).toHaveBeenCalledTimes(1);
		});
	});
});
