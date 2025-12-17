import { database } from "@self-learning/database";
import { z } from "zod";
import { adminProcedure, authProcedure, t } from "../trpc";
import { add } from "date-fns";
import { TRPCError } from "@trpc/server";
import { AccessLevel, GroupRole, Prisma } from "@prisma/client";
import { paginate, Paginated, paginationSchema } from "@self-learning/util/common";
import { GroupFormSchema } from "@self-learning/types";

async function anyTrue(promises: (() => Promise<boolean>)[]) {
	for (const fn of promises) {
		if (await fn()) return true;
	}
	return false;
}

export const AccessLevelEnum = z.nativeEnum(AccessLevel);
const accessLevelHierarchy: Record<AccessLevel, number> = { VIEW: 1, EDIT: 2, FULL: 3 };
export function greaterAccessLevel(a: AccessLevel, b: AccessLevel): boolean {
	return accessLevelHierarchy[a] > accessLevelHierarchy[b];
}
export function greaterOrEqAccessLevel(a: AccessLevel, b: AccessLevel): boolean {
	return accessLevelHierarchy[a] >= accessLevelHierarchy[b];
}

export const GroupRoleEnum = z.nativeEnum(GroupRole);
const groupRoleHierarchy: Record<GroupRole, number> = { MEMBER: 2, ADMIN: 3, OWNER: 4 };
export function greaterOrEqGroupRole(a: GroupRole, b: GroupRole): boolean {
	return groupRoleHierarchy[a] >= groupRoleHierarchy[b];
}

export const ResourceInputSchema = z.union([
	z.object({ courseId: z.string(), lessonId: z.never().optional() }),
	z.object({ lessonId: z.string(), courseId: z.never().optional() })
]);

export type ResourceInput = z.infer<typeof ResourceInputSchema>;

export const ResourceAccessSchema = z.union([
	ResourceInputSchema.options[0].extend({ accessLevel: AccessLevelEnum }),
	ResourceInputSchema.options[1].extend({ accessLevel: AccessLevelEnum })
]);

export type ResourceAccess = z.infer<typeof ResourceAccessSchema>;

export const MembershipInputSchema = z.object({
	groupId: z.number(),
	expiresAt: z.date().nullable(),
	userId: z.string(),
	role: GroupRoleEnum
});
export type MembershipInput = z.infer<typeof MembershipInputSchema>;

export type PermissionInput = {
	groupId: number;
	accessLevel: AccessLevel;
} & ResourceInput;

export async function getUserPermission({
	userId,
	courseId,
	lessonId
}: { userId: string } & ResourceInput) {
	const date = new Date();
	// Find membership
	/* TODO cover isWildcard and isPublic
	OR: [
      // User is member (direct or wildcard permission)
      {
        group: { members: { some: { userId, expiresAt: { gt: date } } } },
        OR: [
          { courseId, lessonId }, // specific resource
          { isWildcart: true }    // wildcard permission
        ]
      },

      // Public permissions (no membership required)
      {
        isPublic: true,
        OR: [
          { courseId, lessonId }, // public specific resource
          { isWildcart: true }    // public wildcard
        ]
      }
    ]
	*/
	const perms = await database.permission.findMany({
		where: {
			courseId,
			lessonId,
			group: {
				members: {
					some: {
						userId: userId,
						OR: [{ expiresAt: null }, { expiresAt: { gt: date } }]
					}
				}
			}
		},
		select: { accessLevel: true, groupId: true }
	});

	// get best access level
	return perms.reduce(
		(prev, curr) => {
			if (!prev.accessLevel || greaterAccessLevel(curr.accessLevel, prev.accessLevel)) {
				return curr;
			}
			return prev;
		},
		{ accessLevel: null as AccessLevel | null, groupId: null as number | null }
	);
}

export async function hasResourcesAccess(userId: string, checks: ResourceAccess[]) {
	const courseIds = checks
		.filter(
			(r): r is { courseId: string; accessLevel: AccessLevel } =>
				"courseId" in r && !!r.courseId
		)
		.map(r => r.courseId);
	const lessonIds = checks
		.filter(
			(r): r is { lessonId: string; accessLevel: AccessLevel } =>
				"lessonId" in r && !!r.lessonId
		)
		.map(r => r.lessonId);
	const perms = await database.permission.findMany({
		where: {
			OR: [
				{
					courseId: { in: courseIds },
					lessonId: null
				},
				{
					lessonId: { in: lessonIds },
					courseId: null
				}
			],
			group: {
				members: {
					some: {
						userId: userId,
						OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }]
					}
				}
			}
		},
		select: { accessLevel: true, courseId: true, lessonId: true }
	});

	// Aggregate best access level per resource
	const result: Record<string, AccessLevel> = {};

	// Compute best access per resource
	for (const perm of perms) {
		const key = perm.courseId ?? perm.lessonId!;

		if (!result[key] || greaterAccessLevel(perm.accessLevel, result[key])) {
			result[key] = perm.accessLevel;
		}
	}
	// Run checks
	return checks.every(check => {
		const key = check.courseId ?? check.lessonId!;
		return !!result[key] && greaterOrEqAccessLevel(result[key], check.accessLevel);
	});
}

export async function createGroupAccess(
	groupId: number,
	userId: string,
	role: GroupRole,
	durationMinutes?: number
) {
	const now = new Date();
	const expiresAt =
		typeof durationMinutes === "number" ? add(now, { minutes: durationMinutes }) : null;

	// build data object
	const data: MembershipInput = { groupId, userId, role, expiresAt };
	return await database.member.create({ data });
}

export async function hasResourceAccess(
	params: { userId: string; accessLevel: AccessLevel } & ResourceInput
) {
	const { accessLevel: actualLevel } = await getUserPermission(params);
	if (!actualLevel) return false;
	return accessLevelHierarchy[actualLevel] >= accessLevelHierarchy[params.accessLevel];
}

export async function getGroupRole(groupId: number, userId: string) {
	const access = await database.member.findFirst({
		where: { userId, groupId, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
		select: { role: true }
	});
	return access?.role ?? null;
}

export async function hasGroupRole(groupId: number, userId: string, role: GroupRole) {
	const groupRole = await getGroupRole(groupId, userId);
	return !!groupRole && greaterOrEqGroupRole(groupRole, role);
}

export async function createGroupPermission(params: PermissionInput) {
	// TODO make log of permission created
	return await database.permission.create({ data: params });
}

export async function getGroup(groupId: number) {
	return await database.group.findUnique({
		where: { id: groupId },
		select: {
			id: true,
			parent: { select: { id: true, name: true } },
			name: true,
			permissions: {
				select: {
					accessLevel: true,
					course: { select: { courseId: true, title: true, slug: true } },
					lesson: { select: { lessonId: true, title: true, slug: true } }
				}
			},
			members: {
				select: {
					role: true,
					expiresAt: true,
					createdAt: true,
					user: {
						select: {
							id: true,
							displayName: true,
							email: true,
							author: { select: { id: true } }
						}
					}
				}
			}
		}
	});
}

export const permissionRouter = t.router({
	// Can be done by "parent" group admins or website admins
	createGroup: authProcedure
		.input(GroupFormSchema.omit({ id: true }))
		.mutation(async ({ input, ctx }) => {
			const { parent, name, permissions, members } = input;
			const userId = ctx.user.id;
			// check so members has no OWNER role
			if (members?.some(m => m.role === GroupRole.OWNER)) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Cannot assign OWNER role when creating group"
				});
			}
			// map permissions to drop display data
			const perms = permissions.map(p => {
				return ResourceAccessSchema.parse({
					accessLevel: p.accessLevel,
					courseId: p.course?.courseId,
					lessonId: p.lesson?.lessonId
				});
			});
			// for every resource must have FULL access level
			const checks = perms.map(p => {
				return { ...p, accessLevel: AccessLevel.FULL };
			});

			// map members to drop display data
			const membs = members.map(m => {
				return { userId: m.user.id, role: m.role, expiresAt: m.expiresAt };
			});
			// check permission - must have full access at parent or be admin
			let hasAccess = ctx.user.role === "ADMIN";
			if (!hasAccess && !!parent?.id) {
				// only website admins can create root groups
				const [groupOk, resourceOk] = await Promise.all([
					hasGroupRole(parent.id, userId, GroupRole.ADMIN),
					hasResourcesAccess(userId, checks)
				]);
				console.log("groupOk", groupOk, "resourceOk", resourceOk);
				hasAccess = groupOk && resourceOk;
			}

			if (!hasAccess) {
				throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions" });
			}
			// create
			return database.group.create({
				data: {
					name,
					parentId: parent?.id,
					permissions: { create: perms },
					members: { create: [...(membs ?? []), { userId, role: GroupRole.OWNER }] }
				}
			});
		}),
	updateGroup: authProcedure.input(GroupFormSchema).mutation(async ({ input, ctx }) => {
		const { id, permissions, members, name, parent } = input;
		const userId = ctx.user.id;
		if (!id) {
			throw new TRPCError({ code: "BAD_REQUEST", message: "Group id is required" });
		}
		// 3. Group name update
		const { name: oldName, parentId: oldParentId } = await database.group.findUniqueOrThrow({
			where: { id },
			select: { name: true, parentId: true }
		});
		// restrict changing parentId (parent?.id produces undefined !== null)
		if ((parent && parent.id) !== oldParentId) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Cannot change parentId of the group"
			});
		}
		// check if update name
		if (name !== oldName) {
			const hasAccess =
				ctx.user.role === "ADMIN" || (await hasGroupRole(id, userId, GroupRole.OWNER));
			if (!hasAccess) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Insufficient permissions to update group name"
				});
			}
		}

		// 1. Members
		// check one member has OWNER role
		const ownerCount = members.filter(m => m.role === GroupRole.OWNER).length;
		const validOwnerCount = members.filter(
			m => m.role === GroupRole.OWNER && m.expiresAt === null
		).length;
		if (ownerCount !== 1 || validOwnerCount !== 1) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "Group must have exactly one OWNER without expiration"
			});
		}
		// map members to drop display data
		const membs = members.map(m => {
			return { userId: m.user.id, role: m.role, expiresAt: m.expiresAt };
		});
		// fetch old members to check if something changed
		const oldMembers = await database.member.findMany({
			where: { groupId: id },
			select: { userId: true, role: true, expiresAt: true }
		});
		const memberDiffs = new Map(membs.map(m => [m.userId, m]));
		for (const m of oldMembers) {
			const d = memberDiffs.get(m.userId);
			if (!d) {
				// was removed - keep in diffs
				memberDiffs.set(m.userId, m);
			} else if (d.role === m.role && d.expiresAt?.getTime() === m.expiresAt?.getTime()) {
				// if unchanged - ignore
				memberDiffs.delete(m.userId);
			}
		}
		// check if has ADMIN permission (only if members have changed)
		if (memberDiffs.size > 0) {
			const hasAccess =
				ctx.user.role === "ADMIN" || (await hasGroupRole(id, userId, GroupRole.ADMIN));
			if (!hasAccess) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Insufficient permissions to update members"
				});
			}
		}

		// 2. Permissions
		// map permissions to drop display data
		const perms = permissions.map(p => {
			return ResourceAccessSchema.parse({
				accessLevel: p.accessLevel,
				courseId: p.course?.courseId,
				lessonId: p.lesson?.lessonId
			});
		});
		// fetch existing permissions to delermine diffs
		const existingPerms = await database.permission.findMany({
			where: { groupId: id },
			select: { lessonId: true, courseId: true, accessLevel: true }
		});
		// compute diffs - deletions and additions/updates
		const toKey = (p: { lessonId?: string | null; courseId?: string | null }) =>
			p.courseId ? `c:${p.courseId}` : `l:${p.lessonId}`;
		const diffs = new Map(perms.map(p => [toKey(p), p]));
		for (const p of existingPerms) {
			const d = diffs.get(toKey(p));
			if (!d) {
				// was removed - add to diffs
				diffs.set(toKey(p), ResourceAccessSchema.parse(p));
			} else if (d.accessLevel === p.accessLevel) {
				// was unchanged - ignore
				diffs.delete(toKey(p));
			}
		}
		// check permission - must have full access at parent or be admin (only if permissions have changed)
		if (diffs.size > 0) {
			// to change resource permission must have FULL access to each
			const checks = Array.from(diffs.values()).map(p => {
				return { ...p, accessLevel: AccessLevel.FULL };
			});
			const hasAccess =
				ctx.user.role === "ADMIN" || (await hasResourcesAccess(userId, checks));

			if (!hasAccess) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Insufficient permissions to update permissions"
				});
			}
		}

		// 4. run update
		return await database.group.update({
			where: { id },
			data: {
				name,
				parentId: parent?.id,
				permissions: {
					deleteMany: {
						OR: [
							// delete course permissions not present in new request
							{
								courseId: {
									notIn: perms.filter(p => p.courseId).map(p => p.courseId!)
								},
								lessonId: null
							},
							// delete lesson permissions not present in new request
							{
								lessonId: {
									notIn: perms.filter(p => p.lessonId).map(p => p.lessonId!)
								},
								courseId: null
							}
						]
					},
					upsert: perms.map(p =>
						p.courseId
							? {
									where: {
										groupId_courseId: { groupId: id, courseId: p.courseId }
									},
									update: { accessLevel: p.accessLevel },
									create: {
										courseId: p.courseId,
										accessLevel: p.accessLevel
									}
								}
							: {
									where: {
										groupId_lessonId: { groupId: id, lessonId: p.lessonId! }
									},
									update: { accessLevel: p.accessLevel },
									create: {
										lessonId: p.lessonId!,
										accessLevel: p.accessLevel
									}
								}
					)
				},
				members: {
					deleteMany: { userId: { notIn: membs.map(m => m.userId) } },
					upsert: membs.map(m => ({
						where: { userId_groupId: { groupId: id, userId: m.userId } },
						update: { role: m.role, expiresAt: m.expiresAt },
						create: m
					}))
				}
			}
		});
	}),
	deleteGroup: authProcedure
		.input(z.object({ groupId: z.number() }))
		.mutation(async ({ input, ctx }) => {
			const { groupId } = input;
			const userId = ctx.user.id;
			// check if user is owner of the group or admin
			const isOwner =
				ctx.user.role === "ADMIN" || (await hasGroupRole(groupId, userId, GroupRole.OWNER));
			if (!isOwner) {
				throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions" });
			}
			// delete group
			return await database.group.delete({ where: { id: groupId } });
		}),
	getResourceAccess: authProcedure.input(ResourceAccessSchema).query(async ({ input, ctx }) => {
		const userId = ctx.user.id;
		return await getUserPermission({ userId, ...input });
	}),
	hasResourceAccess: authProcedure.input(ResourceAccessSchema).query(async ({ input, ctx }) => {
		if (ctx.user.role === "ADMIN") return true;
		return await hasResourceAccess({ userId: ctx.user.id, ...input });
	}),
	// Done by group owners or website admins
	changeGroupOwner: authProcedure
		.input(z.object({ groupId: z.number(), newOwnerId: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const { groupId, newOwnerId } = input;
			let userId: string;
			if (ctx.user.role === "ADMIN") {
				// find current owner
				const owner = await database.member.findFirst({
					where: { groupId, role: GroupRole.OWNER },
					select: { userId: true }
				});
				if (!owner) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "No owner found for this group"
					});
				}
				userId = owner.userId;
			} else {
				// check if user is current owner
				userId = ctx.user.id;
				const isOwner = await hasGroupRole(groupId, userId, GroupRole.OWNER);
				if (!isOwner) {
					throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions" });
				}
			}
			// change owner
			return await database.$transaction([
				database.member.updateMany({
					where: { groupId, userId },
					data: { role: GroupRole.ADMIN }
				}),
				database.member.upsert({
					where: { userId_groupId: { groupId, userId: newOwnerId } },
					create: { groupId, userId: newOwnerId, role: GroupRole.OWNER },
					update: { role: GroupRole.OWNER }
				})
			]);
		}),
	// Done by group admins or website admins. Cannot grant OWNER role - use changeGroupOwner
	grantGroupAccess: authProcedure
		.input(
			z.object({
				groupId: z.number(),
				userId: z.string(),
				role: GroupRoleEnum,
				durationMinutes: z.number().optional()
			})
		)
		.mutation(async ({ input, ctx }) => {
			const { groupId, userId, role, durationMinutes } = input;
			const grantorId = ctx.user.id; // grantor
			if (role === GroupRole.OWNER) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Cannot directly grant OWNER role"
				});
			}
			// first check if grantor has ADMIN permission
			const hasAccess =
				ctx.user.role === "ADMIN" ||
				(await hasGroupRole(groupId, grantorId, GroupRole.ADMIN));
			if (!hasAccess) {
				throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions" });
			}
			// now add user to the group
			return await createGroupAccess(groupId, userId, role, durationMinutes);
			// TODO make log of access created
		}),
	hasGroupRole: authProcedure
		.input(z.object({ groupId: z.number(), role: GroupRoleEnum }))
		.query(async ({ input, ctx }) => {
			if (ctx.user.role === "ADMIN") return true;
			return await hasGroupRole(input.groupId, ctx.user.id, input.role);
		}),
	// Done by resource owners or website admins
	grantGroupPermission: authProcedure
		.input(z.object({ groupId: z.number(), permission: ResourceAccessSchema }))
		.mutation(async ({ input, ctx }) => {
			const { groupId, permission } = input;
			const userId = ctx.user.id; // grantor
			// check if grantor has FULL access level to that resource (does not need to be in the group)
			let hasAccess = ctx.user.role === "ADMIN";
			if (!hasAccess) {
				const { accessLevel } = await getUserPermission({ userId, ...permission });
				hasAccess = !!accessLevel && greaterOrEqAccessLevel(accessLevel, AccessLevel.FULL);
			}
			if (!hasAccess) {
				throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions" });
			}
			// now create new permission
			return await createGroupPermission({ groupId, ...permission });
			// TODO make log of permission created
		}),
	// Done by resource owners, grantor group admins, group admins, or website admins
	revokeGroupPermission: authProcedure
		.input(z.object({ permissionId: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const { permissionId } = input;
			const userId = ctx.user.id;
			// fetch permission which is revoked
			const perm = await database.permission.findUnique({
				where: { id: permissionId },
				select: { groupId: true, courseId: true, lessonId: true }
			});
			if (!perm) {
				throw new TRPCError({ code: "FORBIDDEN", message: "Invalid permission" });
			}
			const data = ResourceInputSchema.parse(perm);

			// can revoke if owner of resource or group editor
			let hasAccess = ctx.user.role === "ADMIN";
			if (!hasAccess) {
				hasAccess = await anyTrue([
					() => hasGroupRole(perm.groupId, userId, GroupRole.ADMIN),
					() => hasResourceAccess({ userId, accessLevel: AccessLevel.FULL, ...data })
				]);
			}
			// delete permission
			return await database.permission.delete({ where: { id: permissionId } });
			// TODO make log of permission revoked
		}),
	// Done by group admins or website admins. Cannot revoke OWNER role - use changeGroupOwner
	revokeGroupAccess: authProcedure
		.input(z.object({ userId: z.string(), groupId: z.number() }))
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.user.id;
			// fetch membership which is revoked
			const membership = await database.member.findUnique({
				where: { userId_groupId: input },
				select: { groupId: true, userId: true, role: true }
			});
			if (!membership) {
				throw new TRPCError({ code: "FORBIDDEN", message: "Invalid membership" });
			}
			if (membership.role === GroupRole.OWNER) {
				throw new TRPCError({ code: "FORBIDDEN", message: "Cannot revoke OWNER role" });
			}
			// check if user has ADMIN role in that group
			const hasAccess =
				ctx.user.role === "ADMIN" ||
				(await hasGroupRole(membership.groupId, userId, GroupRole.ADMIN));
			if (!hasAccess) {
				throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions" });
			}
			// delete membership
			return await database.member.delete({ where: { userId_groupId: input } });
			// TODO make log of access revoked
		}),
	deletePermission: adminProcedure
		.input(z.object({ permissionId: z.string() }))
		.mutation(async ({ input }) => {
			const { permissionId } = input;
			return await database.permission.delete({ where: { id: permissionId } });
		}),
	getGroup: authProcedure.input(z.object({ id: z.number() })).query(async ({ input, ctx }) => {
		const hasAccess =
			ctx.user.role === "ADMIN" ||
			(await hasGroupRole(input.id, ctx.user.id, GroupRole.MEMBER));
		return hasAccess ? await getGroup(input.id) : null;
	}),
	findMyGroups: authProcedure.input(paginationSchema).query(async ({ input, ctx }) => {
		const pageSize = 15;
		const userId = ctx.user.id;

		const where: Prisma.GroupWhereInput = {
			members: { some: { userId } }
		};

		const [groupsRaw, count] = await database.$transaction([
			database.group.findMany({
				include: {
					_count: { select: { members: true } },
					members: {
						where: { role: GroupRole.OWNER },
						take: 1,
						select: { user: { select: { name: true } } }
					}
				},
				...paginate(pageSize, input.page),
				orderBy: { name: "asc" },
				where
			}),
			database.group.count({ where })
		]);
		// flatten result
		const result = groupsRaw.map(g => ({
			groupId: g.id,
			name: g.name,
			memberCount: g._count.members,
			ownerName: g.members[0]?.user.name || null
		}));

		return {
			result,
			pageSize: pageSize,
			page: input.page,
			totalCount: count
		} satisfies Paginated<unknown>;
	}),
	findGroups: t.procedure
		.input(
			paginationSchema.extend({
				name: z.string().optional(),
				authorName: z.string().optional()
			})
		)
		.query(async ({ input }) => {
			const pageSize = 15;

			const where: Prisma.GroupWhereInput = {
				name:
					input.name && input.name.length > 0
						? { contains: input.name, mode: "insensitive" }
						: undefined,
				members: input.authorName
					? {
							some: {
								user: { name: { contains: input.authorName, mode: "insensitive" } }
							}
						}
					: undefined
			};

			const [groupsRaw, count] = await database.$transaction([
				database.group.findMany({
					include: {
						_count: { select: { members: true } },
						members: {
							where: { role: GroupRole.OWNER },
							take: 1,
							select: { user: { select: { name: true } } }
						}
					},
					...paginate(pageSize, input.page),
					orderBy: { name: "asc" },
					where
				}),
				database.group.count({ where })
			]);
			// flatten result
			const result = groupsRaw.map(g => ({
				groupId: g.id,
				name: g.name,
				memberCount: g._count.members,
				ownerName: g.members[0]?.user.name || null
			}));

			return {
				result,
				pageSize: pageSize,
				page: input.page,
				totalCount: count
			} satisfies Paginated<unknown>;
		})
});
