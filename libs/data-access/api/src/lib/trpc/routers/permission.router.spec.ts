import { database } from "@self-learning/database";
import { permissionRouter } from "./permission.router";
import { TRPCError } from "@trpc/server";
import { AccessLevel, GroupRole, Prisma } from "@prisma/client";
import { t } from "../trpc";
import { Context, UserFromSession } from "../context";
import {
	hasGroupRole,
	hasResourceAccessBatch,
	hasResourceAccess,
	createGroupAccess,
	getResourceAccess,
	createResourceAccess,
	getGroup,
	getSingleOwnedResources
} from "../../permissions/permission.service";

jest.mock("@self-learning/database", () => ({
	__esModule: true,
	database: {
		$transaction: jest.fn(),
		group: {
			create: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
			findUnique: jest.fn(),
			findUniqueOrThrow: jest.fn(),
			findMany: jest.fn(),
			count: jest.fn()
		},
		member: {
			findMany: jest.fn(),
			findUnique: jest.fn(),
			delete: jest.fn(),
			count: jest.fn()
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
	hasResourceAccessBatch: jest.fn(),
	hasResourceAccess: jest.fn(),
	createGroupAccess: jest.fn(),
	getResourceAccess: jest.fn(),
	createResourceAccess: jest.fn(),
	getGroup: jest.fn(),
	getSingleOwnedResources: jest.fn()
}));

function prepare(user: Partial<UserFromSession>) {
	const ctx: Context & { user: UserFromSession } = {
		user: {
			id: "user-id",
			name: "john",
			role: "USER",
			isAuthor: false,
			memberships: [],
			featureFlags: {
				learningDiary: false,
				learningStatistics: false,
				experimental: false
			},
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
			const date = new Date();
			date.setDate(date.getDate() + 7); // date in future

			const { caller } = prepare({ role: "ADMIN" });

			const input = {
				name: "Test Group",
				slug: "test-group",
				parent: null,
				permissions: [],
				members: [
					{
						user: testUser,
						role: GroupRole.ADMIN,
						expiresAt: date
					}
				]
			};

			(database.group.create as jest.Mock).mockResolvedValue({
				id: 1,
				name: "Test Group"
			});

			await expect(caller.createGroup(input)).rejects.toMatchObject({
				code: "BAD_REQUEST",
				message: "Group ADMIN role cannot expire"
			} as Partial<TRPCError>);

			expect(database.group.create).not.toHaveBeenCalled();
		});
		it("throws FORBIDDEN if has not FULL permission to all resources", async () => {
			const { caller, ctx } = prepare({});

			(hasGroupRole as jest.Mock).mockResolvedValue(true);
			(hasResourceAccessBatch as jest.Mock).mockResolvedValue(false);

			const input = {
				name: "Test Group",
				slug: "test-group",
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

			expect(hasResourceAccessBatch).toHaveBeenCalledWith(ctx.user.id, [
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
			(hasResourceAccessBatch as jest.Mock).mockResolvedValue(true);

			const input = {
				name: "Test Group",
				slug: "test-group",
				parent: null,
				permissions: [],
				members: []
			};

			await expect(caller.createGroup(input)).rejects.toMatchObject({
				code: "FORBIDDEN"
			} as Partial<TRPCError>);

			expect(hasGroupRole).not.toHaveBeenCalled();
			expect(hasResourceAccessBatch).not.toHaveBeenCalled();
			expect(database.group.create).not.toHaveBeenCalled();
		});
		it("throws FORBIDDEN if not admin creates group", async () => {
			const { caller, ctx } = prepare({});
			(hasGroupRole as jest.Mock).mockResolvedValue(false);
			(hasResourceAccessBatch as jest.Mock).mockResolvedValue(true);

			const input = {
				name: "Test Group",
				slug: "test-group",
				parent: { name: "Parent Group", id: 1 },
				permissions: [],
				members: []
			};

			await expect(caller.createGroup(input)).rejects.toMatchObject({
				code: "FORBIDDEN"
			} as Partial<TRPCError>);

			expect(hasGroupRole).toHaveBeenCalledWith(1, ctx.user.id, GroupRole.ADMIN);
			expect(hasResourceAccessBatch).toHaveBeenCalled();
			expect(database.group.create).not.toHaveBeenCalled();
		});

		it("creates group with requesting user as admin", async () => {
			const { caller, ctx } = prepare({ role: "ADMIN" });
			const input = {
				name: "Test Group",
				slug: "test-group",
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
					slug: "test-group",
					permissions: { create: [] },
					members: {
						create: [{ userId: ctx.user.id, role: GroupRole.ADMIN, expiresAt: null }]
					}
				}
			});
			expect(hasGroupRole).not.toHaveBeenCalled();
			expect(hasResourceAccessBatch).not.toHaveBeenCalled();

			expect(result).toEqual({ id: 1, name: "Test Group" });
		});

		it("creates group with requested members", async () => {
			const { caller, ctx } = prepare({ role: "ADMIN" });
			const date = new Date();
			date.setDate(date.getDate() + 7); // date in future
			const input = {
				name: "Test Group",
				slug: "test-group",
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
					slug: "test-group",
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
			expect(hasResourceAccessBatch).not.toHaveBeenCalled();

			expect(result).toEqual({ id: 1, name: "Test Group" });
		});
	});
	describe("updateGroup", () => {
		it("throws BAD_REQUEST if group id is not given", async () => {
			const { caller } = prepare({ role: "ADMIN" });
			const input = {
				id: null,
				name: "Test Group",
				slug: "test-group",
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
				parentId: 1,
				slug: "old"
			});

			const input = {
				id: 5,
				name: "Old",
				slug: "old",
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
				parentId: null,
				slug: "old"
			});
			(hasGroupRole as jest.Mock).mockResolvedValue(false);

			const input = {
				id: 7,
				name: "NewName",
				slug: "new-name",
				parent: null,
				permissions: [],
				members: []
			};

			await expect(caller.updateGroup(input)).rejects.toMatchObject({
				code: "FORBIDDEN"
			} as Partial<TRPCError>);
			expect(database.group.update).not.toHaveBeenCalled();
		});

		it("throws FORBIDDEN when changing slug without admin/group-admin", async () => {
			const { caller } = prepare({ role: "USER" });
			(database.group.findUniqueOrThrow as jest.Mock).mockResolvedValue({
				name: "Group",
				parentId: null,
				slug: "old-slug"
			});
			(hasGroupRole as jest.Mock).mockResolvedValue(false);

			const input = {
				id: 7,
				name: "Group",
				slug: "new-slug",
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
			const date = new Date();
			date.setDate(date.getDate() + 7); // date in future

			const { caller } = prepare({ role: "ADMIN" });

			(database.group.findUniqueOrThrow as jest.Mock).mockResolvedValue({
				name: "group",
				parentId: null,
				slug: "group"
			});

			const input = {
				id: 8,
				name: "group",
				slug: "group",
				parent: null,
				permissions: [],
				members: [
					{
						user: { ...testUser, id: "u1" },
						role: GroupRole.ADMIN,
						expiresAt: date
					}
				]
			};
			await expect(caller.updateGroup(input)).rejects.toMatchObject({
				code: "BAD_REQUEST",
				message: "Group ADMIN role cannot expire"
			} as Partial<TRPCError>);
			expect(database.group.update).not.toHaveBeenCalled();
		});

		it("throws BAD_REQUEST when no ADMIN remains", async () => {
			const { caller } = prepare({ role: "ADMIN" });

			(database.group.findUniqueOrThrow as jest.Mock).mockResolvedValue({
				name: "Group",
				parentId: null,
				slug: "group"
			});

			const input = {
				id: 9,
				name: "Group",
				slug: "group",
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

		it("throws FORBIDDEN when members were changed and user is not group admin", async () => {
			const { caller } = prepare({ role: "USER" });
			(database.group.findUniqueOrThrow as jest.Mock).mockResolvedValue({
				name: "Group",
				parentId: null,
				slug: "group"
			});
			(database.member.findMany as jest.Mock).mockResolvedValue([
				{ userId: "a", role: GroupRole.MEMBER, expiresAt: null }
			]);

			// incoming members differ -> memberDiffs > 0
			const input = {
				id: 10,
				name: "Group",
				slug: "group",
				parent: null,
				permissions: [],
				members: [
					{ user: { ...testUser, id: "b" }, role: GroupRole.ADMIN, expiresAt: null }
				]
			};

			(hasGroupRole as jest.Mock).mockResolvedValue(false);
			(hasResourceAccessBatch as jest.Mock).mockResolvedValue(true);

			await expect(caller.updateGroup(input)).rejects.toMatchObject({
				code: "FORBIDDEN"
			} as Partial<TRPCError>);
			expect(database.group.update).not.toHaveBeenCalled();
		});

		it("throws FORBIDDEN when member was deleted and user is not group admin", async () => {
			const { caller } = prepare({ role: "USER" });
			(database.group.findUniqueOrThrow as jest.Mock).mockResolvedValue({
				name: "Group",
				parentId: null,
				slug: "group"
			});
			(database.member.findMany as jest.Mock).mockResolvedValue([
				{ userId: "a", role: GroupRole.MEMBER, expiresAt: null }, // removed
				{ userId: "b", role: GroupRole.ADMIN, expiresAt: null } // unchanged
			]);

			// incoming members differ -> memberDiffs > 0
			const input = {
				id: 10,
				name: "Group",
				slug: "group",
				parent: null,
				permissions: [],
				members: [
					{ user: { ...testUser, id: "b" }, role: GroupRole.ADMIN, expiresAt: null }
				]
			};

			(hasGroupRole as jest.Mock).mockResolvedValue(false);
			(hasResourceAccessBatch as jest.Mock).mockResolvedValue(true);

			await expect(caller.updateGroup(input)).rejects.toMatchObject({
				code: "FORBIDDEN"
			} as Partial<TRPCError>);
			expect(database.group.update).not.toHaveBeenCalled();
		});

		it("throws FORBIDDEN when permission diffs and user lacks resource FULL access", async () => {
			const { caller } = prepare({ role: "USER" });
			(database.group.findUniqueOrThrow as jest.Mock).mockResolvedValue({
				name: "Group",
				parentId: null,
				slug: "group"
			});
			(database.member.findMany as jest.Mock).mockResolvedValue([]);
			(database.permission.findMany as jest.Mock).mockResolvedValue([
				{ courseId: "c1", accessLevel: AccessLevel.EDIT }, // changed
				{ courseId: "c2", accessLevel: AccessLevel.EDIT }, // removed
				{ courseId: "c3", accessLevel: AccessLevel.VIEW } // unchanged
			]);

			const input = {
				id: 11,
				name: "Group",
				slug: "group",
				parent: null,
				permissions: [
					{
						course: { courseId: "c1", slug: "c1", title: "c1" },
						accessLevel: AccessLevel.FULL
					},
					{
						course: { courseId: "c3", slug: "c3", title: "c3" },
						accessLevel: AccessLevel.VIEW
					}
				],
				members: [
					{ user: { ...testUser, id: "a" }, role: GroupRole.ADMIN, expiresAt: null }
				]
			};

			(hasResourceAccessBatch as jest.Mock).mockResolvedValue(false);
			(hasGroupRole as jest.Mock).mockResolvedValue(true);

			expect(database.group.update).not.toHaveBeenCalled();
			await expect(caller.updateGroup(input)).rejects.toMatchObject({
				code: "FORBIDDEN"
			} as Partial<TRPCError>);
		});

		it("updates group when user is admin", async () => {
			const date = new Date();
			date.setDate(date.getDate() + 7); // date in future

			const { caller } = prepare({ role: "ADMIN" });
			(database.group.findUniqueOrThrow as jest.Mock).mockResolvedValue({
				name: "Group",
				parentId: null,
				slug: "group"
			});
			// cover changed and unchanged members
			(database.member.findMany as jest.Mock).mockResolvedValue([
				{ userId: "b", role: GroupRole.MEMBER, expiresAt: date }
			]);
			// cover changed and unchanged permissions
			(database.permission.findMany as jest.Mock).mockResolvedValue([
				{ courseId: "c1", accessLevel: AccessLevel.EDIT },
				{ lessonId: "l1", accessLevel: AccessLevel.VIEW }
			]);

			(database.group.update as jest.Mock).mockResolvedValue({ id: 12, name: "Group" });

			const input = {
				id: 12,
				name: "Group",
				slug: "group",
				parent: null,
				permissions: [
					{
						course: { courseId: "c1", slug: "c1", title: "c1" },
						accessLevel: AccessLevel.FULL
					},
					{
						lesson: { lessonId: "l1", slug: "l1", title: "l1" },
						accessLevel: AccessLevel.FULL
					}
				],
				members: [
					{ user: { ...testUser, id: "a" }, role: GroupRole.ADMIN, expiresAt: null },
					{ user: { ...testUser, id: "b" }, role: GroupRole.MEMBER, expiresAt: date }
				]
			};

			(hasGroupRole as jest.Mock).mockResolvedValue(false);
			(hasResourceAccessBatch as jest.Mock).mockResolvedValue(false);

			const res = await caller.updateGroup(input);
			expect(database.group.update).toHaveBeenCalled();
			expect(res).toEqual({ id: 12, name: "Group" });
		});
	});

	describe("mergeGroups", () => {
		it("throws BAD_REQUEST when no valid groups found", async () => {
			const { caller } = prepare({ role: "ADMIN" });

			// all groups missing
			(database.group.findUnique as jest.Mock).mockResolvedValue(null);

			await expect(
				caller.mergeGroups({
					name: "Merged",
					slug: "merged",
					groupIds: [100, 101],
					strategy: "first"
				})
			).rejects.toMatchObject({
				code: "BAD_REQUEST",
				message: "No valid groups found"
			} as Partial<TRPCError>);
		});
		it("throws FORBIDDEN if user is not admin and not admin in all groups", async () => {
			const { caller, ctx } = prepare({ role: "USER" });

			// user lacks admin in provided groups
			(hasGroupRole as jest.Mock).mockResolvedValue(false);

			await expect(
				caller.mergeGroups({
					name: "Merged",
					slug: "merged",
					groupIds: [1, 2],
					strategy: "first"
				})
			).rejects.toMatchObject({ code: "FORBIDDEN" } as Partial<TRPCError>);

			expect(hasGroupRole).toHaveBeenCalledWith(1, ctx.user.id, GroupRole.ADMIN);
			expect(hasGroupRole).toHaveBeenCalledWith(2, ctx.user.id, GroupRole.ADMIN);
		});

		it("merges groups when user has admin role in all groups", async () => {
			const { caller, ctx } = prepare({ role: "USER" });

			(hasGroupRole as jest.Mock).mockResolvedValue(true);

			const g1 = {
				id: 1,
				name: "G1",
				parentId: null,
				members: [{ userId: "u1", role: GroupRole.ADMIN, expiresAt: null }],
				permissions: [],
				children: []
			};

			(database.group.findUnique as jest.Mock).mockResolvedValue(g1);
			(database.group.create as jest.Mock).mockResolvedValue({ id: 1, name: "Merged" });

			await caller.mergeGroups({
				name: "Merged",
				slug: "merged",
				groupIds: [1],
				strategy: "first"
			});

			expect(hasGroupRole).toHaveBeenCalledWith(1, ctx.user.id, GroupRole.ADMIN);
			expect(database.group.create).toHaveBeenCalled();
		});

		it("merges groups with strategy 'first' when user is ADMIN and skips null groups", async () => {
			const { caller } = prepare({ role: "ADMIN" });

			const g1 = {
				id: 1,
				name: "G1",
				parentId: 10,
				members: [
					{
						userId: "u1",
						role: GroupRole.MEMBER,
						expiresAt: null,
						createdAt: new Date("2023-01-01")
					},
					{
						userId: "u2",
						role: GroupRole.ADMIN,
						expiresAt: null,
						createdAt: new Date("2023-01-02")
					}
				],
				permissions: [
					{
						id: "p1",
						courseId: "c1",
						lessonId: null,
						accessLevel: AccessLevel.EDIT,
						isPublic: false
					},
					{
						id: "p2",
						courseId: "c2",
						lessonId: null,
						accessLevel: AccessLevel.VIEW,
						isPublic: true
					}
				],
				children: [{ id: 4 }, { id: 2 }]
			};
			const g2 = {
				id: 2,
				name: "G2",
				parentId: 10,
				members: [
					{
						userId: "u1",
						role: GroupRole.ADMIN,
						expiresAt: null,
						createdAt: new Date("2023-01-03")
					},
					{
						userId: "u3",
						role: GroupRole.MEMBER,
						expiresAt: null,
						createdAt: new Date("2023-01-04")
					}
				],
				permissions: [
					{
						id: "p3",
						courseId: null,
						lessonId: "l1",
						accessLevel: AccessLevel.FULL,
						isPublic: false
					},
					{
						id: "p1",
						courseId: "c1",
						lessonId: null,
						accessLevel: AccessLevel.FULL,
						isPublic: false
					}
				],
				children: [{ id: 5 }]
			};

			(database.group.findUnique as jest.Mock).mockImplementation(
				async ({ where: { id } }) => {
					if (id === 1) return g1;
					if (id === 2) return g2;
					return null;
				}
			);

			(database.group.create as jest.Mock).mockResolvedValue({ id: 1, name: "Merged Group" });

			await caller.mergeGroups({
				name: "Merged Group",
				slug: "merged-group",
				groupIds: [1, 2, 3],
				strategy: "first"
			});

			expect(database.group.create).toHaveBeenCalledTimes(1);

			// inspect create data
			const createArg = (database.group.create as jest.Mock).mock.calls[0][0];
			expect(createArg.data.name).toBe("Merged Group");
			expect(createArg.data.slug).toBe("merged-group");
			expect(createArg.data.parent).toStrictEqual({ connect: { id: 10 } }); // first non-null parentId

			// members: first strategy => first occurrence of u1 remains (MEMBER), plus u2 and u3
			expect(createArg.data.members.create).toEqual(
				expect.arrayContaining([
					{
						user: { connect: { id: "u1" } },
						role: GroupRole.MEMBER,
						expiresAt: null,
						createdAt: expect.any(Date)
					},
					{
						user: { connect: { id: "u2" } },
						role: GroupRole.ADMIN,
						expiresAt: null,
						createdAt: expect.any(Date)
					},
					{
						user: { connect: { id: "u3" } },
						role: GroupRole.MEMBER,
						expiresAt: null,
						createdAt: expect.any(Date)
					}
				])
			);

			// permissions: should include p1 (highest FULL), p2, p3
			expect(createArg.data.permissions.create).toHaveLength(3);
			const p1Perm = createArg.data.permissions.create.find(
				(p: any) => p.course?.connect?.courseId === "c1"
			);
			expect(p1Perm.accessLevel).toBe(AccessLevel.FULL);

			// children: original children were 4,2 and 5; groupIds [1,2,3] removed => expect 4 and 5
			const childrenIds = createArg.data.children.connect
				.map((c: { id: number }) => c.id)
				.sort();
			expect(childrenIds).toEqual([4, 5].sort());
		});

		it("chooses highest member role when strategy is 'highest'", async () => {
			const { caller } = prepare({ role: "ADMIN" });

			const a = {
				id: 10,
				name: "A",
				parentId: null,
				members: [
					{
						userId: "x",
						role: GroupRole.MEMBER,
						expiresAt: null,
						createdAt: new Date("2023-01-05")
					}
				],
				permissions: [],
				children: []
			};
			const b = {
				id: 11,
				name: "B",
				parentId: null,
				members: [
					{
						userId: "x",
						role: GroupRole.ADMIN,
						expiresAt: null,
						createdAt: new Date("2023-01-06")
					}
				],
				permissions: [],
				children: []
			};

			(database.group.findUnique as jest.Mock).mockImplementation(
				async ({ where: { id } }) => {
					if (id === 10) return a;
					if (id === 11) return b;
					return null;
				}
			);

			(database.group.create as jest.Mock).mockResolvedValue({ id: 1, name: "Merged" });

			await caller.mergeGroups({
				name: "Merged",
				slug: "merged",
				groupIds: [10, 11],
				strategy: "highest"
			});

			const createArg = (database.group.create as jest.Mock).mock.calls[0][0];
			// x should be ADMIN (highest)
			expect(createArg.data.members.create).toEqual(
				expect.arrayContaining([
					{
						user: { connect: { id: "x" } },
						role: GroupRole.ADMIN,
						expiresAt: null,
						createdAt: expect.any(Date)
					}
				])
			);
		});

		it("chooses lowest member role when strategy is 'lowest'", async () => {
			const { caller } = prepare({ role: "ADMIN" });

			const a = {
				id: 20,
				name: "A",
				parentId: null,
				members: [
					{
						userId: "y",
						role: GroupRole.ADMIN,
						expiresAt: null,
						createdAt: new Date("2023-01-07")
					}
				],
				permissions: [],
				children: []
			};
			const b = {
				id: 21,
				name: "B",
				parentId: null,
				members: [
					{
						userId: "y",
						role: GroupRole.MEMBER,
						expiresAt: null,
						createdAt: new Date("2023-01-08")
					}
				],
				permissions: [],
				children: []
			};

			(database.group.findUnique as jest.Mock).mockImplementation(
				async ({ where: { id } }) => {
					if (id === 20) return a;
					if (id === 21) return b;
					return null;
				}
			);

			(database.group.create as jest.Mock).mockResolvedValue({ id: 1, name: "Merged" });

			await caller.mergeGroups({
				name: "Merged",
				slug: "merged",
				groupIds: [20, 21],
				strategy: "lowest"
			});

			const createArg = (database.group.create as jest.Mock).mock.calls[0][0];
			// y should be MEMBER (lowest)
			expect(createArg.data.members.create).toEqual(
				expect.arrayContaining([
					{
						user: { connect: { id: "y" } },
						role: GroupRole.MEMBER,
						expiresAt: null,
						createdAt: expect.any(Date)
					}
				])
			);
		});

		it("throws BAD_REQUEST on database constraint error", async () => {
			const { caller } = prepare({ role: "ADMIN" });

			const g1 = {
				id: 1,
				name: "G1",
				parentId: null,
				members: [
					{
						userId: "u1",
						role: GroupRole.ADMIN,
						expiresAt: null,
						createdAt: new Date("2023-01-09")
					}
				],
				permissions: [],
				children: []
			};

			(database.group.findUnique as jest.Mock).mockResolvedValue(g1);

			const error = new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
				code: "P2002",
				clientVersion: "4.0.0"
			});
			(database.group.create as jest.Mock).mockRejectedValue(error);

			await expect(
				caller.mergeGroups({
					name: "Merged",
					slug: "merged",
					groupIds: [1],
					strategy: "first"
				})
			).rejects.toMatchObject({
				code: "BAD_REQUEST",
				message: "Database error: Unique constraint failed"
			} as Partial<TRPCError>);
		});

		it("throws INTERNAL_SERVER_ERROR on other database errors", async () => {
			const { caller } = prepare({ role: "ADMIN" });

			const g1 = {
				id: 1,
				name: "G1",
				parentId: null,
				members: [
					{
						userId: "u1",
						role: GroupRole.ADMIN,
						expiresAt: null,
						createdAt: new Date("2023-01-10")
					}
				],
				permissions: [],
				children: []
			};

			(database.group.findUnique as jest.Mock).mockResolvedValue(g1);

			(database.group.create as jest.Mock).mockRejectedValue(new Error("Some other error"));

			await expect(
				caller.mergeGroups({
					name: "Merged",
					slug: "merged",
					groupIds: [1],
					strategy: "first"
				})
			).rejects.toMatchObject({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to merge groups"
			} as Partial<TRPCError>);
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

			(getSingleOwnedResources as jest.Mock).mockResolvedValue([]);
			(database.group.delete as jest.Mock).mockResolvedValue({ id: 7 });

			const res = await caller.deleteGroup({ groupId: 7 });

			expect(database.group.delete).toHaveBeenCalledWith({ where: { id: 7 } });
			expect(res).toEqual({ id: 7 });
		});

		it("deletes group when user is group admin", async () => {
			const { caller, ctx } = prepare({ role: "USER" });

			(hasGroupRole as jest.Mock).mockResolvedValue(true);
			(getSingleOwnedResources as jest.Mock).mockResolvedValue([]);
			(database.group.delete as jest.Mock).mockResolvedValue({ id: 99 });

			const res = await caller.deleteGroup({ groupId: 99 });

			expect(hasGroupRole).toHaveBeenCalledWith(99, ctx.user.id, GroupRole.ADMIN);
			expect(database.group.delete).toHaveBeenCalledWith({ where: { id: 99 } });
			expect(res).toEqual({ id: 99 });
		});

		it("throws BAD_REQUEST when group owns resources", async () => {
			const { caller } = prepare({ role: "ADMIN" });

			(getSingleOwnedResources as jest.Mock).mockResolvedValue([
				{ course: { title: "Course 1", courseId: "c1" }, lesson: null }
			]);

			await expect(caller.deleteGroup({ groupId: 1 })).rejects.toMatchObject({
				code: "BAD_REQUEST"
			} as Partial<TRPCError>);

			expect(database.group.delete).not.toHaveBeenCalled();
		});
	});

	describe("leaveGroup", () => {
		it("throws FORBIDDEN when membership not found", async () => {
			const { caller } = prepare({ role: "USER" });

			(database.member.findUnique as jest.Mock).mockResolvedValue(null);

			await expect(caller.leaveGroup({ groupId: 1 })).rejects.toMatchObject({
				code: "FORBIDDEN",
				message: "Invalid membership"
			} as Partial<TRPCError>);

			expect(database.member.delete).not.toHaveBeenCalled();
		});

		it("throws FORBIDDEN when user is the only ADMIN", async () => {
			const { caller } = prepare({ role: "USER" });

			(database.member.findUnique as jest.Mock).mockResolvedValue({
				groupId: 1,
				userId: "user-id",
				role: GroupRole.ADMIN
			});
			(database.member.count as jest.Mock).mockResolvedValue(1);

			await expect(caller.leaveGroup({ groupId: 1 })).rejects.toMatchObject({
				code: "FORBIDDEN",
				message: "Cannot leave group as you are the only ADMIN"
			} as Partial<TRPCError>);

			expect(database.member.delete).not.toHaveBeenCalled();
		});

		it("deletes membership when user is ADMIN but not the only one", async () => {
			const { caller } = prepare({ role: "USER" });

			(database.member.findUnique as jest.Mock).mockResolvedValue({
				groupId: 1,
				userId: "user-id",
				role: GroupRole.ADMIN
			});
			(database.member.count as jest.Mock).mockResolvedValue(2);
			(database.member.delete as jest.Mock).mockResolvedValue({ id: 1 });

			const result = await caller.leaveGroup({ groupId: 1 });

			expect(database.member.count).toHaveBeenCalledWith({
				where: { groupId: 1, role: GroupRole.ADMIN }
			});
			expect(database.member.delete).toHaveBeenCalledWith({
				where: { userId_groupId: { groupId: 1, userId: "user-id" } }
			});
			expect(result).toEqual({ id: 1 });
		});

		it("deletes membership when user is not ADMIN", async () => {
			const { caller } = prepare({ role: "USER" });

			(database.member.findUnique as jest.Mock).mockResolvedValue({
				groupId: 1,
				userId: "user-id",
				role: GroupRole.MEMBER
			});
			(database.member.delete as jest.Mock).mockResolvedValue({ id: 2 });

			const result = await caller.leaveGroup({ groupId: 1 });

			expect(database.member.count).not.toHaveBeenCalled();
			expect(database.member.delete).toHaveBeenCalledWith({
				where: { userId_groupId: { groupId: 1, userId: "user-id" } }
			});
			expect(result).toEqual({ id: 2 });
		});
	});

	describe("getSingleOwnedResources", () => {
		it("throws FORBIDDEN if user is not admin and not group admin", async () => {
			const { caller } = prepare({ role: "USER" });

			(hasGroupRole as jest.Mock).mockResolvedValue(false);

			await expect(caller.getSingleOwnedResources({ groupId: 1 })).rejects.toMatchObject({
				code: "FORBIDDEN",
				message: "Insufficient permissions"
			} as Partial<TRPCError>);

			expect(getSingleOwnedResources).not.toHaveBeenCalled();
		});

		it("returns owned resources when user is website admin", async () => {
			const { caller } = prepare({ role: "ADMIN" });

			const mockResult = [{ course: { title: "Course 1", courseId: "c1" }, lesson: null }];
			(getSingleOwnedResources as jest.Mock).mockResolvedValue(mockResult);

			const result = await caller.getSingleOwnedResources({ groupId: 1 });

			expect(hasGroupRole).not.toHaveBeenCalled();
			expect(getSingleOwnedResources).toHaveBeenCalledWith(1);
			expect(result).toEqual(mockResult);
		});

		it("returns owned resources when user is group admin", async () => {
			const { caller } = prepare({ role: "USER" });

			(hasGroupRole as jest.Mock).mockResolvedValue(true);
			const mockResult = [{ lesson: { title: "Lesson 1", lessonId: "l1" }, course: null }];
			(getSingleOwnedResources as jest.Mock).mockResolvedValue(mockResult);

			const result = await caller.getSingleOwnedResources({ groupId: 1 });

			expect(hasGroupRole).toHaveBeenCalledWith(1, "user-id", GroupRole.ADMIN);
			expect(getSingleOwnedResources).toHaveBeenCalledWith(1);
			expect(result).toEqual(mockResult);
		});
	});

	describe("getResourceAccess", () => {
		it("returns resource access from service", async () => {
			const { caller } = prepare({ role: "USER" });
			(getResourceAccess as jest.Mock).mockResolvedValue([
				{ courseId: "c1", accessLevel: AccessLevel.VIEW }
			]);

			const res = await caller.getResourceAccess({ courseId: "c1" });

			expect(getResourceAccess).toHaveBeenCalledWith({
				userId: "user-id",
				courseId: "c1",
				lessonId: undefined
			});
			expect(res).toEqual([{ courseId: "c1", accessLevel: AccessLevel.VIEW }]);
		});
	});

	describe("hasResourceAccess", () => {
		it("returns resource access check from service", async () => {
			const { caller } = prepare({ role: "USER" });
			(hasResourceAccess as jest.Mock).mockResolvedValue(true);

			const res = await caller.hasResourceAccess({
				courseId: "c2",
				accessLevel: AccessLevel.EDIT
			});
			expect(hasResourceAccess).toHaveBeenCalledWith({
				courseId: "c2",
				lessonId: undefined,
				userId: "user-id",
				accessLevel: AccessLevel.EDIT
			});
			expect(res).toEqual(true);
		});

		it("returns true when user is ADMIN", async () => {
			const { caller } = prepare({ role: "ADMIN" });
			const res = await caller.hasResourceAccess({
				courseId: "c2",
				accessLevel: AccessLevel.FULL
			});
			expect(hasResourceAccess).not.toHaveBeenCalled();
			expect(res).toEqual(true);
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

	describe("hasGroupRole", () => {
		it("returns resource role check from service", async () => {
			const { caller, ctx } = prepare({ role: "USER" });
			(hasGroupRole as jest.Mock).mockResolvedValue(true);

			const res = await caller.hasGroupRole({
				groupId: 1,
				role: GroupRole.MEMBER
			});
			expect(hasGroupRole).toHaveBeenCalledWith(1, ctx.user.id, GroupRole.MEMBER);
			expect(res).toEqual(true);
		});

		it("returns true when user is ADMIN", async () => {
			const { caller } = prepare({ role: "ADMIN" });
			const res = await caller.hasGroupRole({
				groupId: 1,
				role: GroupRole.ADMIN
			});
			expect(hasGroupRole).not.toHaveBeenCalled();
			expect(res).toEqual(true);
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

	describe("getGroup", () => {
		it("returns group when user is ADMIN", async () => {
			const { caller } = prepare({ role: "ADMIN" });
			(getGroup as jest.Mock).mockResolvedValue({ id: 1, name: "Group" });

			const result = await caller.getGroup({ id: 1 });

			expect(getGroup).toHaveBeenCalledWith(1);
			expect(result).toEqual({ id: 1, name: "Group" });
		});

		it("returns group when user has MEMBER role", async () => {
			const { caller, ctx } = prepare({ role: "USER" });
			(hasGroupRole as jest.Mock).mockResolvedValue(true);
			(getGroup as jest.Mock).mockResolvedValue({ id: 1, name: "Group" });

			const result = await caller.getGroup({ id: 1 });

			expect(hasGroupRole).toHaveBeenCalledWith(1, ctx.user.id, GroupRole.MEMBER);
			expect(getGroup).toHaveBeenCalledWith(1);
			expect(result).toEqual({ id: 1, name: "Group" });
		});

		it("returns null when user lacks access", async () => {
			const { caller, ctx } = prepare({ role: "USER" });
			(hasGroupRole as jest.Mock).mockResolvedValue(false);

			const result = await caller.getGroup({ id: 1 });

			expect(hasGroupRole).toHaveBeenCalledWith(1, ctx.user.id, GroupRole.MEMBER);
			expect(getGroup).not.toHaveBeenCalled();
			expect(result).toBeNull();
		});
	});

	describe("findGroups", () => {
		it("returns all groups for global query", async () => {
			const caller = t.createCallerFactory(permissionRouter)({});
			const mockGroups = [{ id: 1, name: "Group1", members: [{ user: { name: "User1" } }] }];
			(database.$transaction as jest.Mock).mockResolvedValue([mockGroups, 1]);

			const result = await caller.findGroups({ page: 1, isGlobal: true });

			expect(database.$transaction).toHaveBeenCalledWith([
				database.group.findMany({
					include: {
						members: {
							select: { user: { select: { name: true } } }
						}
					},
					skip: 0,
					take: 15,
					orderBy: { name: "asc" },
					where: {}
				}),
				database.group.count({
					where: {}
				})
			]);
			expect(result).toEqual({
				result: [{ groupId: 1, name: "Group1", members: ["User1"] }],
				pageSize: 15,
				page: 1,
				totalCount: 1
			});
		});

		it("returns groups for user in non-global query", async () => {
			const { caller } = prepare({ id: "user-id" });
			const mockGroups = [{ id: 1, name: "Group1", members: [{ user: { name: "User1" } }] }];
			(database.$transaction as jest.Mock).mockResolvedValue([mockGroups, 1]);

			const result = await caller.findGroups({ page: 1, isGlobal: false });

			expect(database.$transaction).toHaveBeenCalledWith([
				database.group.findMany({
					include: {
						members: {
							select: { user: { select: { name: true } } }
						}
					},
					skip: 0,
					take: 15,
					orderBy: { name: "asc" },
					where: {
						AND: [{ members: { some: { userId: "user-id" } } }]
					}
				}),
				database.group.count({
					where: {
						AND: [{ members: { some: { userId: "user-id" } } }]
					}
				})
			]);
			expect(result).toEqual({
				result: [{ groupId: 1, name: "Group1", members: ["User1"] }],
				pageSize: 15,
				page: 1,
				totalCount: 1
			});
		});

		it("throws UNAUTHORIZED for non-global query without user", async () => {
			const caller = t.createCallerFactory(permissionRouter)({});

			await expect(caller.findGroups({ page: 1, isGlobal: false })).rejects.toMatchObject({
				code: "UNAUTHORIZED"
			} as Partial<TRPCError>);
		});

		it("filters by name", async () => {
			const caller = t.createCallerFactory(permissionRouter)({});
			(database.$transaction as jest.Mock).mockResolvedValue([[], 0]);

			await caller.findGroups({ page: 1, isGlobal: true, name: "Test" });

			expect(database.$transaction).toHaveBeenCalledWith([
				database.group.findMany({
					include: {
						members: {
							select: { user: { select: { name: true } } }
						}
					},
					skip: 0,
					take: 15,
					orderBy: { name: "asc" },
					where: {
						name: { contains: "Test", mode: "insensitive" }
					}
				}),
				database.group.count({
					where: {
						name: { contains: "Test", mode: "insensitive" }
					}
				})
			]);
		});

		it("filters by members", async () => {
			const caller = t.createCallerFactory(permissionRouter)({});
			(database.$transaction as jest.Mock).mockResolvedValue([[], 0]);

			await caller.findGroups({ page: 1, isGlobal: true, members: ["user1", "user2"] });

			expect(database.$transaction).toHaveBeenCalledWith([
				database.group.findMany({
					include: {
						members: {
							select: { user: { select: { name: true } } }
						}
					},
					skip: 0,
					take: 15,
					orderBy: { name: "asc" },
					where: {
						AND: [
							{ members: { some: { userId: "user1" } } },
							{ members: { some: { userId: "user2" } } }
						]
					}
				}),
				database.group.count({
					where: {
						AND: [
							{ members: { some: { userId: "user1" } } },
							{ members: { some: { userId: "user2" } } }
						]
					}
				})
			]);
		});

		it("filters by excluded groups", async () => {
			const caller = t.createCallerFactory(permissionRouter)({});
			(database.$transaction as jest.Mock).mockResolvedValue([[], 0]);

			await caller.findGroups({ page: 1, isGlobal: true, exclude: [1, 2] });

			expect(database.$transaction).toHaveBeenCalledWith([
				database.group.findMany({
					include: {
						members: {
							select: { user: { select: { name: true } } }
						}
					},
					skip: 0,
					take: 15,
					orderBy: { name: "asc" },
					where: {
						id: { notIn: [1, 2] }
					}
				}),
				database.group.count({
					where: {
						id: { notIn: [1, 2] }
					}
				})
			]);
		});

		it("combines filters", async () => {
			const caller = t.createCallerFactory(permissionRouter)({});
			(database.$transaction as jest.Mock).mockResolvedValue([[], 0]);

			await caller.findGroups({
				page: 1,
				isGlobal: true,
				name: "Test",
				members: ["user1"],
				exclude: [1]
			});

			expect(database.$transaction).toHaveBeenCalledWith([
				database.group.findMany({
					include: {
						members: {
							select: { user: { select: { name: true } } }
						}
					},
					skip: 0,
					take: 15,
					orderBy: { name: "asc" },
					where: {
						name: { contains: "Test", mode: "insensitive" },
						AND: [{ members: { some: { userId: "user1" } } }],
						id: { notIn: [1] }
					}
				}),
				database.group.count({
					where: {
						name: { contains: "Test", mode: "insensitive" },
						AND: [{ members: { some: { userId: "user1" } } }],
						id: { notIn: [1] }
					}
				})
			]);
		});
	});
});
