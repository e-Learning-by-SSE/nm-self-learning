import { database } from "@self-learning/database";
import { permissionRouter } from "./permission.router";
import { TRPCError } from "@trpc/server";
import { AccessLevel, GroupRole } from "@prisma/client";
import { t } from "../trpc";
import { Context, UserFromSession } from "../context";
import {
	hasGroupRole,
	hasResourcesAccess,
	hasResourceAccess,
	createGroupAccess,
	getResourceAccess,
	createResourceAccess
} from "../../permissions/permission.service";

jest.mock("@self-learning/database", () => ({
	__esModule: true,
	database: {
		group: {
			create: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
			findUniqueOrThrow: jest.fn()
		},
		member: {
			findMany: jest.fn(),
			findUnique: jest.fn(),
			delete: jest.fn()
		},
		permission: {
			findMany: jest.fn(),
			findUnique: jest.fn(),
			delete: jest.fn()
		}
	}
}));

jest.mock("../../permissions/permission.service", () => ({
	hasGroupRole: jest.fn(),
	hasResourcesAccess: jest.fn(),
	hasResourceAccess: jest.fn(),
	createGroupAccess: jest.fn(),
	getResourceAccess: jest.fn(),
	createResourceAccess: jest.fn()
}));

function prepare(user: Partial<UserFromSession>) {
	const ctx: Context & { user: UserFromSession } = {
		user: {
			id: "user-id",
			name: "john",
			role: "USER",
			isAuthor: false,
			enabledFeatureLearningDiary: false,
			enabledLearningStatistics: false,
			memberships: [],
			...user
		}
	};
	const caller = t.createCallerFactory(permissionRouter)(ctx);
	return { caller, ctx };
}

describe("permissionRouter", () => {
	const testUser = {
		id: "---IGNORE---",
		displayName: "---IGNORE---",
		email: "test@test.com",
		author: null
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("createGroup", () => {
		it("throws BAD_REQUEST if group has admin member has defined expiresAt", async () => {
			const { caller } = prepare({ role: "ADMIN" });

			const input = {
				name: "Test Group",
				parent: null,
				permissions: [],
				members: [
					{
						user: testUser,
						role: GroupRole.ADMIN,
						expiresAt: new Date()
					}
				]
			};

			(database.group.create as jest.Mock).mockResolvedValue({
				id: 1,
				name: "Test Group"
			});

			await expect(caller.createGroup(input)).rejects.toMatchObject({
				code: "BAD_REQUEST"
			} as Partial<TRPCError>);

			expect(database.group.create).not.toHaveBeenCalled();
		});
		it("throws FORBIDDEN if has not FULL permission to all resources", async () => {
			const { caller, ctx } = prepare({});

			(hasGroupRole as jest.Mock).mockResolvedValue(true);
			(hasResourcesAccess as jest.Mock).mockResolvedValue(false);

			const input = {
				name: "Test Group",
				parent: { name: "Parent Group", id: 1 },
				permissions: [
					{
						course: { courseId: "c1", slug: "c1", title: "c1" },
						accessLevel: AccessLevel.VIEW
					},
					{
						lesson: { lessonId: "l1", slug: "l1", title: "l1" },
						accessLevel: AccessLevel.EDIT
					}
				],
				members: []
			};

			await expect(caller.createGroup(input)).rejects.toMatchObject({
				code: "FORBIDDEN"
			} as Partial<TRPCError>);

			expect(hasResourcesAccess).toHaveBeenCalledWith(ctx.user.id, [
				{
					courseId: "c1",
					accessLevel: AccessLevel.FULL
				},
				{
					lessonId: "l1",
					accessLevel: AccessLevel.FULL
				}
			]);
			expect(hasGroupRole).toHaveBeenCalledWith(1, ctx.user.id, GroupRole.ADMIN);

			expect(database.group.create).not.toHaveBeenCalled();
		});
		it("throws FORBIDDEN if non website admin creates root group", async () => {
			const { caller } = prepare({ role: "USER" });

			(hasGroupRole as jest.Mock).mockResolvedValue(true);
			(hasResourcesAccess as jest.Mock).mockResolvedValue(true);

			const input = {
				name: "Test Group",
				parent: null,
				permissions: [],
				members: []
			};

			await expect(caller.createGroup(input)).rejects.toMatchObject({
				code: "FORBIDDEN"
			} as Partial<TRPCError>);

			expect(hasGroupRole).not.toHaveBeenCalled();
			expect(hasResourcesAccess).not.toHaveBeenCalled();
			expect(database.group.create).not.toHaveBeenCalled();
		});
		it("throws FORBIDDEN if not admin creates group", async () => {
			const { caller, ctx } = prepare({});
			(hasGroupRole as jest.Mock).mockResolvedValue(false);
			(hasResourcesAccess as jest.Mock).mockResolvedValue(true);

			const input = {
				name: "Test Group",
				parent: { name: "Parent Group", id: 1 },
				permissions: [],
				members: []
			};

			await expect(caller.createGroup(input)).rejects.toMatchObject({
				code: "FORBIDDEN"
			} as Partial<TRPCError>);

			expect(hasGroupRole).toHaveBeenCalledWith(1, ctx.user.id, GroupRole.ADMIN);
			expect(hasResourcesAccess).toHaveBeenCalled();
			expect(database.group.create).not.toHaveBeenCalled();
		});

		it("creates group with requesting user as admin", async () => {
			const { caller, ctx } = prepare({ role: "ADMIN" });
			const input = {
				name: "Test Group",
				parent: null,
				permissions: [],
				members: []
			};

			(database.group.create as jest.Mock).mockResolvedValue({
				id: 1,
				name: "Test Group"
			});

			const result = await caller.createGroup(input);
			expect(database.group.create).toHaveBeenCalledTimes(1);
			expect(database.group.create).toHaveBeenCalledWith({
				data: {
					name: "Test Group",
					permissions: { create: [] },
					members: {
						create: [{ userId: ctx.user.id, role: GroupRole.ADMIN, expiresAt: null }]
					}
				}
			});
			expect(hasGroupRole).not.toHaveBeenCalled();
			expect(hasResourcesAccess).not.toHaveBeenCalled();

			expect(result).toEqual({ id: 1, name: "Test Group" });
		});

		it("creates group with requested members", async () => {
			const { caller, ctx } = prepare({ role: "ADMIN" });
			const date = new Date();
			date.setDate(date.getDate() + 7); // date in future
			const input = {
				name: "Test Group",
				parent: null,
				permissions: [],
				members: [
					{
						user: { ...testUser, id: ctx.user.id },
						role: GroupRole.ADMIN,
						expiresAt: null
					},
					{
						user: { ...testUser, id: "test-user" },
						role: GroupRole.MEMBER,
						expiresAt: date
					}
				]
			};

			(database.group.create as jest.Mock).mockResolvedValue({
				id: 1,
				name: "Test Group"
			});

			const result = await caller.createGroup(input);
			expect(database.group.create).toHaveBeenCalledTimes(1);
			expect(database.group.create).toHaveBeenCalledWith({
				data: {
					name: "Test Group",
					permissions: { create: [] },
					members: {
						create: [
							{ userId: ctx.user.id, role: GroupRole.ADMIN, expiresAt: null },
							{ userId: "test-user", role: GroupRole.MEMBER, expiresAt: date }
						]
					}
				}
			});
			expect(hasGroupRole).not.toHaveBeenCalled();
			expect(hasResourcesAccess).not.toHaveBeenCalled();

			expect(result).toEqual({ id: 1, name: "Test Group" });
		});
	});
	describe("updateGroup", () => {
		it("throws BAD_REQUEST if group id is not given", async () => {
			const { caller } = prepare({ role: "ADMIN" });
			const input = {
				id: null,
				name: "Test Group",
				parent: null,
				permissions: [],
				members: []
			};

			await expect(caller.updateGroup(input)).rejects.toMatchObject({
				code: "BAD_REQUEST"
			} as Partial<TRPCError>);

			expect(database.group.update).not.toHaveBeenCalled();
		});

		it("throws FORBIDDEN if trying to change parentId", async () => {
			const { caller } = prepare({ role: "ADMIN" });

			(database.group.findUniqueOrThrow as jest.Mock).mockResolvedValue({
				name: "Old",
				parentId: 1
			});

			const input = {
				id: 5,
				name: "Old",
				parent: { id: 2, name: "New Parent" },
				permissions: [],
				members: []
			};

			await expect(caller.updateGroup(input)).rejects.toMatchObject({
				code: "FORBIDDEN"
			} as Partial<TRPCError>);
			expect(database.group.update).not.toHaveBeenCalled();
		});

		it("throws FORBIDDEN when renaming without admin/group-admin", async () => {
			const { caller } = prepare({ role: "USER" });
			(database.group.findUniqueOrThrow as jest.Mock).mockResolvedValue({
				name: "Old",
				parentId: null
			});
			(hasGroupRole as jest.Mock).mockResolvedValue(false);

			const input = {
				id: 7,
				name: "NewName",
				parent: null,
				permissions: [],
				members: []
			};

			await expect(caller.updateGroup(input)).rejects.toMatchObject({
				code: "FORBIDDEN"
			} as Partial<TRPCError>);
			expect(database.group.update).not.toHaveBeenCalled();
		});

		it("throws BAD_REQUEST if ADMIN member has expiresAt defined", async () => {
			const { caller } = prepare({ role: "ADMIN" });

			(database.group.findUniqueOrThrow as jest.Mock).mockResolvedValue({
				name: "G",
				parentId: null
			});

			const input = {
				id: 8,
				name: "G",
				parent: null,
				permissions: [],
				members: [
					{
						user: { ...testUser, id: "u1" },
						role: GroupRole.ADMIN,
						expiresAt: new Date()
					}
				]
			};

			await expect(caller.updateGroup(input)).rejects.toMatchObject({
				code: "BAD_REQUEST"
			} as Partial<TRPCError>);
			expect(database.group.update).not.toHaveBeenCalled();
		});

		it("throws BAD_REQUEST when no ADMIN remains", async () => {
			const { caller } = prepare({ role: "ADMIN" });

			(database.group.findUniqueOrThrow as jest.Mock).mockResolvedValue({
				name: "G",
				parentId: null
			});

			const input = {
				id: 9,
				name: "G",
				parent: null,
				permissions: [],
				members: [
					{ user: { ...testUser, id: "u1" }, role: GroupRole.MEMBER, expiresAt: null }
				]
			};

			await expect(caller.updateGroup(input)).rejects.toMatchObject({
				code: "BAD_REQUEST"
			} as Partial<TRPCError>);
			expect(database.group.update).not.toHaveBeenCalled();
		});

		it("throws FORBIDDEN when members changed and user is not group admin", async () => {
			const { caller } = prepare({ role: "USER" });
			(database.group.findUniqueOrThrow as jest.Mock).mockResolvedValue({
				name: "Group",
				parentId: null
			});
			(database.member.findMany as jest.Mock).mockResolvedValue([
				{ userId: "a", role: GroupRole.MEMBER, expiresAt: null }
			]);

			// incoming members differ -> memberDiffs > 0
			const input = {
				id: 10,
				name: "Group",
				parent: null,
				permissions: [],
				members: [
					{ user: { ...testUser, id: "b" }, role: GroupRole.ADMIN, expiresAt: null }
				]
			};

			(hasGroupRole as jest.Mock).mockResolvedValue(false);
			(hasResourcesAccess as jest.Mock).mockResolvedValue(true);

			await expect(caller.updateGroup(input)).rejects.toMatchObject({
				code: "FORBIDDEN"
			} as Partial<TRPCError>);
			expect(database.group.update).not.toHaveBeenCalled();
		});

		it("throws FORBIDDEN when permission diffs and user lacks resource FULL access", async () => {
			const { caller } = prepare({ role: "USER" });
			(database.group.findUniqueOrThrow as jest.Mock).mockResolvedValue({
				name: "Group",
				parentId: null
			});
			(database.member.findMany as jest.Mock).mockResolvedValue([]);
			(database.permission.findMany as jest.Mock).mockResolvedValue([
				{ courseId: "c1", accessLevel: AccessLevel.EDIT }
			]);

			const input = {
				id: 11,
				name: "Group",
				parent: null,
				permissions: [
					{
						course: { courseId: "c1", slug: "c1", title: "c1" },
						accessLevel: AccessLevel.FULL
					}
				],
				members: [
					{ user: { ...testUser, id: "a" }, role: GroupRole.ADMIN, expiresAt: null }
				]
			};

			(hasResourcesAccess as jest.Mock).mockResolvedValue(false);
			(hasGroupRole as jest.Mock).mockResolvedValue(true);

			expect(database.group.update).not.toHaveBeenCalled();
			await expect(caller.updateGroup(input)).rejects.toMatchObject({
				code: "FORBIDDEN"
			} as Partial<TRPCError>);
		});

		it("updates group when user is admin", async () => {
			const { caller } = prepare({ role: "ADMIN" });
			(database.group.findUniqueOrThrow as jest.Mock).mockResolvedValue({
				name: "Group",
				parentId: null
			});
			(database.member.findMany as jest.Mock).mockResolvedValue([]);
			(database.permission.findMany as jest.Mock).mockResolvedValue([]);

			(database.group.update as jest.Mock).mockResolvedValue({ id: 12, name: "Group" });

			const input = {
				id: 12,
				name: "Group",
				parent: null,
				permissions: [],
				members: [
					{ user: { ...testUser, id: "a" }, role: GroupRole.ADMIN, expiresAt: null }
				]
			};

			(hasGroupRole as jest.Mock).mockResolvedValue(false);
			(hasResourcesAccess as jest.Mock).mockResolvedValue(false);

			const res = await caller.updateGroup(input);
			expect(database.group.update).toHaveBeenCalled();
			expect(res).toEqual({ id: 12, name: "Group" });
		});
	});

	describe("deleteGroup", () => {
		it("throws FORBIDDEN if user is not admin and not group admin", async () => {
			const { caller } = prepare({ role: "USER" });

			(hasGroupRole as jest.Mock).mockResolvedValue(false);

			await expect(caller.deleteGroup({ groupId: 42 })).rejects.toMatchObject({
				code: "FORBIDDEN"
			} as Partial<TRPCError>);

			expect(database.group.delete).not.toHaveBeenCalled();
		});

		it("deletes group when user is website admin", async () => {
			const { caller } = prepare({ role: "ADMIN" });

			(database.group.delete as jest.Mock).mockResolvedValue({ id: 7 });

			const res = await caller.deleteGroup({ groupId: 7 });

			expect(database.group.delete).toHaveBeenCalledWith({ where: { id: 7 } });
			expect(res).toEqual({ id: 7 });
		});

		it("deletes group when user is group admin", async () => {
			const { caller, ctx } = prepare({ role: "USER" });

			(hasGroupRole as jest.Mock).mockResolvedValue(true);
			(database.group.delete as jest.Mock).mockResolvedValue({ id: 99 });

			const res = await caller.deleteGroup({ groupId: 99 });

			expect(hasGroupRole).toHaveBeenCalledWith(99, ctx.user.id, GroupRole.ADMIN);
			expect(database.group.delete).toHaveBeenCalledWith({ where: { id: 99 } });
			expect(res).toEqual({ id: 99 });
		});
	});

	describe("grantGroupAccess", () => {
		it("throws FORBIDDEN when grantor is not admin and not group admin", async () => {
			const { caller } = prepare({ role: "USER" });
			(hasGroupRole as jest.Mock).mockResolvedValue(false);

			await expect(
				caller.grantGroupAccess({
					groupId: 1,
					userId: "u2",
					role: GroupRole.MEMBER,
					durationMinutes: 10
				})
			).rejects.toMatchObject({ code: "FORBIDDEN" } as Partial<TRPCError>);
			expect(createGroupAccess).not.toHaveBeenCalled();
		});

		it("grants access when grantor is website admin", async () => {
			const { caller } = prepare({ role: "ADMIN" });
			(createGroupAccess as jest.Mock).mockResolvedValue({ id: 5 });

			const res = await caller.grantGroupAccess({
				groupId: 2,
				userId: "u3",
				role: GroupRole.MEMBER,
				durationMinutes: 15
			});

			expect(createGroupAccess).toHaveBeenCalledWith(2, "u3", GroupRole.MEMBER, 15);
			expect(res).toEqual({ id: 5 });
		});

		it("grants access when grantor is group admin", async () => {
			const { caller, ctx } = prepare({ role: "USER" });
			(hasGroupRole as jest.Mock).mockResolvedValue(true);
			(createGroupAccess as jest.Mock).mockResolvedValue({ id: 6 });

			const res = await caller.grantGroupAccess({
				groupId: 3,
				userId: "u4",
				role: GroupRole.ADMIN
			});

			expect(hasGroupRole).toHaveBeenCalledWith(3, ctx.user.id, GroupRole.ADMIN);
			expect(createGroupAccess).toHaveBeenCalledWith(3, "u4", GroupRole.ADMIN, undefined);
			expect(res).toEqual({ id: 6 });
		});
	});
	describe("revokeGroupAccess", () => {
		it("throws FORBIDDEN if membership not found", async () => {
			const { caller } = prepare({ role: "ADMIN" });
			(database.member.findUnique as jest.Mock).mockResolvedValue(null);

			await expect(
				caller.revokeGroupAccess({ userId: "x", groupId: 1 })
			).rejects.toMatchObject({
				code: "FORBIDDEN"
			} as Partial<TRPCError>);
			expect(database.member.delete).not.toHaveBeenCalled();
		});

		it("deletes membership when caller is admin", async () => {
			const { caller } = prepare({ role: "ADMIN" });
			(database.member.findUnique as jest.Mock).mockResolvedValue({
				groupId: 2,
				userId: "x",
				role: GroupRole.MEMBER
			});
			(database.member.delete as jest.Mock).mockResolvedValue({ userId: "x", groupId: 2 });

			const res = await caller.revokeGroupAccess({ userId: "x", groupId: 2 });
			expect(database.member.delete).toHaveBeenCalledWith({
				where: { userId_groupId: { userId: "x", groupId: 2 } }
			});
			expect(res).toEqual({ userId: "x", groupId: 2 });
		});

		it("deletes membership when caller is group admin", async () => {
			const { caller, ctx } = prepare({ role: "USER" });
			(database.member.findUnique as jest.Mock).mockResolvedValue({
				groupId: 3,
				userId: "y",
				role: GroupRole.MEMBER
			});
			(hasGroupRole as jest.Mock).mockResolvedValue(true);
			(database.member.delete as jest.Mock).mockResolvedValue({ userId: "y", groupId: 3 });

			const res = await caller.revokeGroupAccess({ userId: "y", groupId: 3 });
			expect(hasGroupRole).toHaveBeenCalledWith(3, ctx.user.id, GroupRole.ADMIN);
			expect(database.member.delete).toHaveBeenCalled();
			expect(res).toEqual({ userId: "y", groupId: 3 });
		});

		it("throws FORBIDDEN when caller lacks rights", async () => {
			const { caller } = prepare({ role: "USER" });
			(database.member.findUnique as jest.Mock).mockResolvedValue({
				groupId: 4,
				userId: "z",
				role: GroupRole.MEMBER
			});
			(hasGroupRole as jest.Mock).mockResolvedValue(false);

			await expect(
				caller.revokeGroupAccess({ userId: "z", groupId: 4 })
			).rejects.toMatchObject({
				code: "FORBIDDEN"
			} as Partial<TRPCError>);
			expect(database.member.delete).not.toHaveBeenCalled();
		});
	});

	describe("grantGroupPermission", () => {
		it("throws FORBIDDEN when grantor lacks access", async () => {
			const { caller } = prepare({ role: "USER" });
			(hasResourceAccess as jest.Mock).mockResolvedValue(false);

			await expect(
				caller.grantGroupPermission({
					groupId: 1,
					permission: { courseId: "c1", accessLevel: AccessLevel.FULL }
				})
			).rejects.toMatchObject({ code: "FORBIDDEN" } as Partial<TRPCError>);
			expect(createResourceAccess).not.toHaveBeenCalled();
		});

		it("creates permission when caller is admin", async () => {
			const { caller } = prepare({ role: "ADMIN" });
			(createResourceAccess as jest.Mock).mockResolvedValue({ id: "p1" });

			const res = await caller.grantGroupPermission({
				groupId: 2,
				permission: { courseId: "c2", accessLevel: AccessLevel.FULL }
			});
			expect(createResourceAccess).toHaveBeenCalledWith({
				groupId: 2,
				courseId: "c2",
				accessLevel: AccessLevel.FULL
			});
			expect(res).toEqual({ id: "p1" });
		});

		it("creates permission when caller has resource FULL access", async () => {
			const { caller, ctx } = prepare({ role: "USER" });
			(hasResourceAccess as jest.Mock).mockResolvedValue(true);
			(createResourceAccess as jest.Mock).mockResolvedValue({ id: "p2" });

			const res = await caller.grantGroupPermission({
				groupId: 3,
				permission: { courseId: "c3", accessLevel: AccessLevel.FULL }
			});
			expect(hasResourceAccess).toHaveBeenCalledWith({
				userId: ctx.user.id,
				courseId: "c3",
				accessLevel: AccessLevel.FULL
			});
			expect(createResourceAccess).toHaveBeenCalledWith({
				groupId: 3,
				courseId: "c3",
				accessLevel: AccessLevel.FULL
			});
			expect(res).toEqual({ id: "p2" });
		});
	});

	describe("revokeGroupPermission", () => {
		it("throws FORBIDDEN when permission is invalid", async () => {
			const { caller } = prepare({ role: "ADMIN" });
			(database.permission.findUnique as jest.Mock).mockResolvedValue(null);

			await expect(
				caller.revokeGroupPermission({ permissionId: "nope" })
			).rejects.toMatchObject({
				code: "FORBIDDEN"
			} as Partial<TRPCError>);
			expect(database.permission.delete).not.toHaveBeenCalled();
		});

		it("deletes permission when caller is admin", async () => {
			const { caller } = prepare({ role: "ADMIN" });
			(database.permission.findUnique as jest.Mock).mockResolvedValue({
				id: "p",
				groupId: 1,
				courseId: "c1"
			});
			(database.permission.delete as jest.Mock).mockResolvedValue({ id: "p" });

			const res = await caller.revokeGroupPermission({ permissionId: "p" });
			expect(database.permission.delete).toHaveBeenCalledWith({ where: { id: "p" } });
			expect(res).toEqual({ id: "p" });
		});

		it("deletes permission when caller is group admin", async () => {
			const { caller, ctx } = prepare({ role: "USER" });
			(database.permission.findUnique as jest.Mock).mockResolvedValue({
				id: "p2",
				groupId: 2,
				courseId: "c2"
			});
			(hasGroupRole as jest.Mock).mockResolvedValue(true);
			(database.permission.delete as jest.Mock).mockResolvedValue({ id: "p2" });

			const res = await caller.revokeGroupPermission({ permissionId: "p2" });
			expect(hasGroupRole).toHaveBeenCalledWith(2, ctx.user.id, GroupRole.ADMIN);
			expect(database.permission.delete).toHaveBeenCalledWith({ where: { id: "p2" } });
			expect(res).toEqual({ id: "p2" });
		});

		it("deletes permission when caller has resource FULL access", async () => {
			const { caller } = prepare({ role: "USER" });
			(database.permission.findUnique as jest.Mock).mockResolvedValue({
				id: "p3",
				groupId: 3,
				courseId: "c3"
			});
			(hasGroupRole as jest.Mock).mockResolvedValue(false);
			(hasResourceAccess as jest.Mock).mockResolvedValue(true);
			(database.permission.delete as jest.Mock).mockResolvedValue({ id: "p3" });

			const res = await caller.revokeGroupPermission({ permissionId: "p3" });
			expect(hasResourceAccess).toHaveBeenCalled();
			expect(database.permission.delete).toHaveBeenCalledWith({ where: { id: "p3" } });
			expect(res).toEqual({ id: "p3" });
		});

		it("throws FORBIDDEN when caller lacks rights", async () => {
			const { caller } = prepare({ role: "USER" });
			(database.permission.findUnique as jest.Mock).mockResolvedValue({
				id: "p4",
				groupId: 4,
				courseId: "c4"
			});
			(hasGroupRole as jest.Mock).mockResolvedValue(false);
			(hasResourceAccess as jest.Mock).mockResolvedValue(false);

			expect(database.permission.delete).not.toHaveBeenCalled();
			await expect(
				caller.revokeGroupPermission({ permissionId: "p4" })
			).rejects.toMatchObject({ code: "FORBIDDEN" } as Partial<TRPCError>);
		});
	});
});
