import { database } from "@self-learning/database";
import { AccessLevel, GroupRole } from "@prisma/client";
import { UserFromSession } from "../trpc/context";
import type { ResourceInput, ResourcePermission } from "@self-learning/types";

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
	getEffectiveResourceAccesses,
	testGroupCircularParent,
	canCreate,
	canDelete,
	canEdit,
	canRead,
	preparePermissionsForCreate,
	preparePermissionsForUpdate,
	prepareResourceUpdate
} from "./permission.service";
import { anyTrue } from "./permission.utils";

describe("permission.service", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("canRead", () => {
		it("always returns true", async () => {
			const user = { role: "USER", id: "u1" } as UserFromSession;
			expect(await canRead(user, { courseId: "c1" })).toBe(true);
		});
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

			const res = await getResourceAccess("u1", { courseId: "c1" });

			expect(res).toEqual({ accessLevel: AccessLevel.FULL, groupId: 3 });
		});

		it("returns null access level and groupId when user has no permissions", async () => {
			(database.permission.findMany as jest.Mock).mockResolvedValue([]);

			const res = await getResourceAccess("u1", { courseId: "c1" });

			expect(res).toEqual({ accessLevel: null, groupId: null });
		});

		it("throws BAD_REQUEST for invalid resource input", async () => {
			await expect(getResourceAccess("u1", {} as ResourceInput)).rejects.toMatchObject({
				code: "BAD_REQUEST"
			});
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

		it("returns true when user has required access for specialization and subject", async () => {
			(database.permission.findMany as jest.Mock).mockResolvedValue([
				{ accessLevel: AccessLevel.EDIT, specializationId: "sp1" },
				{ accessLevel: AccessLevel.FULL, subjectId: "sb1" }
			]);

			const ok = await hasResourceAccessBatch("u1", [
				{ specializationId: "sp1", accessLevel: AccessLevel.EDIT },
				{ subjectId: "sb1", accessLevel: AccessLevel.VIEW }
			]);
			expect(ok).toBe(true);
		});

		it("should not mix specialization id with subject permission row", async () => {
			(database.permission.findMany as jest.Mock).mockResolvedValue([
				{ accessLevel: AccessLevel.FULL, subjectId: "sp1" }
			]);

			const ok = await hasResourceAccessBatch("u1", [
				{ specializationId: "sp1", accessLevel: AccessLevel.EDIT }
			]);
			expect(ok).toBe(false);
		});
	});

	describe("hasResourceAccess", () => {
		it("returns true when user's actual level meets required level", async () => {
			(database.permission.findMany as jest.Mock).mockResolvedValue([
				{ accessLevel: AccessLevel.FULL, groupId: 1 }
			]);

			const ok = await hasResourceAccess("u1", {
				courseId: "c1",
				accessLevel: AccessLevel.FULL
			});
			expect(ok).toBe(true);
		});

		it("returns true when user's level higher than required level", async () => {
			(database.permission.findMany as jest.Mock).mockResolvedValue([
				{ accessLevel: AccessLevel.FULL, groupId: 1 }
			]);

			const ok = await hasResourceAccess("u1", {
				courseId: "c1",
				accessLevel: AccessLevel.EDIT
			});
			expect(ok).toBe(true);
		});

		it("returns false when user's level lower than required level", async () => {
			(database.permission.findMany as jest.Mock).mockResolvedValue([
				{ accessLevel: AccessLevel.VIEW, groupId: 1 }
			]);

			const ok = await hasResourceAccess("u1", {
				courseId: "c1",
				accessLevel: AccessLevel.EDIT
			});
			expect(ok).toBe(false);
		});

		it("returns false when user has no access", async () => {
			(database.permission.findMany as jest.Mock).mockResolvedValue([]);

			const ok = await hasResourceAccess("u1", {
				courseId: "c1",
				accessLevel: AccessLevel.VIEW
			});
			expect(ok).toBe(false);
		});

		it("checks access for specializationId", async () => {
			(database.permission.findMany as jest.Mock).mockResolvedValue([
				{ accessLevel: AccessLevel.EDIT, groupId: 1 }
			]);

			const ok = await hasResourceAccess("u1", {
				specializationId: "sp1",
				accessLevel: AccessLevel.EDIT
			});
			expect(ok).toBe(true);
		});

		it("checks access for subjectId", async () => {
			(database.permission.findMany as jest.Mock).mockResolvedValue([
				{ accessLevel: AccessLevel.VIEW, groupId: 2 }
			]);

			const ok = await hasResourceAccess("u1", {
				subjectId: "sb1",
				accessLevel: AccessLevel.VIEW
			});
			expect(ok).toBe(true);
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

		it("throws BAD_REQUEST when no FULL permission is provided", async () => {
			await expect(
				preparePermissionsForCreate([
					{ groupId: 1, accessLevel: AccessLevel.VIEW },
					{ groupId: 2, accessLevel: AccessLevel.EDIT }
				])
			).rejects.toMatchObject({ code: "BAD_REQUEST" });
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

		it("returns update payload for specializationId", async () => {
			(database.permission.findMany as jest.Mock).mockResolvedValue([
				{ groupId: 1, accessLevel: AccessLevel.VIEW }
			]);

			const result = await preparePermissionsForUpdate({ specializationId: "sp1" }, [
				{ groupId: 1, accessLevel: AccessLevel.FULL }
			]);

			expect(result?.upsert[0].where).toEqual({
				groupId_specializationId: { groupId: 1, specializationId: "sp1" }
			});
		});

		it("returns update payload for subjectId", async () => {
			(database.permission.findMany as jest.Mock).mockResolvedValue([
				{ groupId: 2, accessLevel: AccessLevel.VIEW }
			]);

			const result = await preparePermissionsForUpdate({ subjectId: "sb1" }, [
				{ groupId: 2, accessLevel: AccessLevel.FULL }
			]);

			expect(result?.upsert[0].where).toEqual({
				groupId_subjectId: { groupId: 2, subjectId: "sb1" }
			});
		});
	});

	describe("prepareResourceUpdate", () => {
		const user = { role: "USER", id: "u1", memberships: [1] } as UserFromSession;

		beforeEach(() => {
			(database.permission.findMany as jest.Mock).mockReset();
		});

		it("throws FORBIDDEN when user lacks EDIT access and permissions unchanged", async () => {
			(database.permission.findMany as jest.Mock)
				.mockResolvedValueOnce([{ groupId: 1, accessLevel: AccessLevel.FULL }])
				.mockResolvedValueOnce([{ accessLevel: AccessLevel.VIEW, groupId: 1 }]);

			await expect(
				prepareResourceUpdate(user, { courseId: "c1" }, [
					{
						groupId: 1,
						groupName: "G1",
						accessLevel: AccessLevel.FULL
					} as ResourcePermission
				])
			).rejects.toMatchObject({ code: "FORBIDDEN" });
		});

		it("returns undefined when permissions unchanged and user has EDIT access", async () => {
			(database.permission.findMany as jest.Mock)
				.mockResolvedValueOnce([{ groupId: 1, accessLevel: AccessLevel.FULL }])
				.mockResolvedValueOnce([{ accessLevel: AccessLevel.EDIT, groupId: 1 }]);

			const result = await prepareResourceUpdate(user, { courseId: "c1" }, [
				{ groupId: 1, groupName: "G1", accessLevel: AccessLevel.FULL } as ResourcePermission
			]);

			expect(result).toBeUndefined();
		});

		it("throws FORBIDDEN when permissions change but user lacks FULL access", async () => {
			(database.permission.findMany as jest.Mock)
				.mockResolvedValueOnce([{ groupId: 1, accessLevel: AccessLevel.VIEW }])
				.mockResolvedValueOnce([{ accessLevel: AccessLevel.EDIT, groupId: 1 }]);

			await expect(
				prepareResourceUpdate(user, { subjectId: "sb1" }, [
					{
						groupId: 1,
						groupName: "G1",
						accessLevel: AccessLevel.FULL
					} as ResourcePermission
				])
			).rejects.toMatchObject({ code: "FORBIDDEN" });
		});

		it("returns update payload when permissions change and user has FULL access", async () => {
			(database.permission.findMany as jest.Mock)
				.mockResolvedValueOnce([{ groupId: 1, accessLevel: AccessLevel.VIEW }])
				.mockResolvedValueOnce([{ accessLevel: AccessLevel.FULL, groupId: 1 }]);

			const result = await prepareResourceUpdate(user, { lessonId: "l1" }, [
				{ groupId: 1, groupName: "G1", accessLevel: AccessLevel.FULL } as ResourcePermission
			]);

			expect(result?.upsert).toHaveLength(1);
		});

		it("allows ADMIN without membership permission lookup", async () => {
			const adminUser = { role: "ADMIN", id: "admin" } as UserFromSession;
			(database.permission.findMany as jest.Mock).mockResolvedValueOnce([
				{ groupId: 1, accessLevel: AccessLevel.VIEW }
			]);

			const result = await prepareResourceUpdate(adminUser, { courseId: "c1" }, [
				{ groupId: 1, groupName: "G1", accessLevel: AccessLevel.FULL } as ResourcePermission
			]);

			expect(result?.upsert).toHaveLength(1);
			expect(database.permission.findMany).toHaveBeenCalledTimes(1);
		});
	});

	describe("permission.utils anyTrue", () => {
		it("returns true on first resolving true promise", async () => {
			const calls: number[] = [];
			const result = await anyTrue([
				async () => {
					calls.push(1);
					return false;
				},
				async () => {
					calls.push(2);
					return true;
				},
				async () => {
					calls.push(3);
					return true;
				}
			]);
			expect(result).toBe(true);
			expect(calls).toEqual([1, 2]);
		});

		it("returns false when all promises resolve false", async () => {
			const result = await anyTrue([async () => false, async () => false]);
			expect(result).toBe(false);
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

	describe("getEffectiveResourceAccesses", () => {
		it("throws BAD_REQUEST for invalid resource input", async () => {
			await expect(getEffectiveResourceAccesses({} as ResourceInput)).rejects.toMatchObject({
				code: "BAD_REQUEST"
			});
		});

		it("aggregates best access per user across groups", async () => {
			(database.permission.findMany as jest.Mock).mockResolvedValue([
				{
					accessLevel: AccessLevel.VIEW,
					id: "p1",
					group: {
						name: "G1",
						slug: "g1",
						id: 1,
						members: [
							{ user: { displayName: "U1", image: null, name: "u1", id: "u1" } }
						]
					}
				},
				{
					accessLevel: AccessLevel.EDIT,
					id: "p2",
					group: {
						name: "G2",
						slug: "g2",
						id: 2,
						members: [
							{ user: { displayName: "U1", image: null, name: "u1", id: "u1" } }
						]
					}
				}
			]);

			const result = await getEffectiveResourceAccesses({ subjectId: "sb1" });

			expect(result).toHaveLength(1);
			expect(result[0].accessLevel).toBe(AccessLevel.EDIT);
			expect(result[0].user.id).toBe("u1");
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
						},
						{
							specialization: {
								permissions: {
									none: { accessLevel: AccessLevel.FULL, NOT: { groupId: 1 } }
								}
							}
						},
						{
							subject: {
								permissions: {
									none: { accessLevel: AccessLevel.FULL, NOT: { groupId: 1 } }
								}
							}
						}
					]
				},
				select: {
					course: { select: { title: true, courseId: true, slug: true } },
					lesson: { select: { title: true, lessonId: true, slug: true } },
					specialization: { select: { title: true, specializationId: true, slug: true } },
					subject: { select: { title: true, subjectId: true, slug: true } }
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
