import { database } from "@self-learning/database";
import { z } from "zod";
import { adminProcedure, authProcedure, t } from "../trpc";
import { add } from "date-fns";
import { TRPCError } from "@trpc/server";
import { AccessLevel, GroupRole } from "@prisma/client";

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
	groupId: z.string().uuid(),
	expiresAt: z.date().nullable(),
	userId: z.string(),
	role: GroupRoleEnum
});
export type MembershipInput = z.infer<typeof MembershipInputSchema>;

export type PermissionInput = {
	groupId: string;
	grantorId?: string | null;
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
			group: { members: { some: { userId: userId, expiresAt: { gt: date } } } }
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
		{ accessLevel: null as AccessLevel | null, groupId: null as string | null }
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
			courseId: { in: courseIds },
			lessonId: { in: lessonIds },
			group: { members: { some: { userId: userId, expiresAt: { gt: new Date() } } } }
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
	groupId: string,
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

export async function getGroupRole(groupId: string, userId: string) {
	const access = await database.member.findFirst({
		where: { userId, groupId, expiresAt: { gt: new Date() } },
		select: { role: true }
	});
	return access?.role ?? null;
}

export async function hasGroupRole(groupId: string, userId: string, role: GroupRole) {
	const groupRole = await getGroupRole(groupId, userId);
	return !!groupRole && greaterOrEqGroupRole(groupRole, role);
}

export async function createGroupPermission(params: PermissionInput) {
	// TODO make log of permission created
	return await database.permission.create({ data: params });
}

export const permissionRouter = t.router({
	// Can be done by "parent" group admins or website admins
	createGroup: authProcedure
		.input(
			z.object({
				parentId: z.string().optional(),
				name: z.string(),
				permissions: ResourceAccessSchema.array(),
				members: z
					.object({
						userId: z.string(),
						role: GroupRoleEnum,
						durationMinutes: z.number().optional()
					})
					.array()
					.optional()
			})
		)
		.mutation(async ({ input, ctx }) => {
			const { parentId, name, permissions, members } = input;
			const userId = ctx.user.id;
			// check so members has no OWNER role
			if (members?.some(m => m.role === GroupRole.OWNER)) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Cannot assign OWNER role when creating group"
				});
			}
			// compute expiredAt
			const m = members?.map(m => {
				const now = new Date();
				const expiresAt =
					typeof m.durationMinutes === "number"
						? add(now, { minutes: m.durationMinutes })
						: null;
				return { userId: m.userId, role: m.role, expiresAt };
			});
			// check permission - must have full access at parent or be admin
			let hasAccess = ctx.user.role === "ADMIN";
			if (!hasAccess && !!parentId) {
				// only website admins can create root groups
				const [groupOk, resourceOk] = await Promise.all([
					hasGroupRole(parentId, userId, GroupRole.ADMIN),
					hasResourcesAccess(userId, permissions)
				]);
				hasAccess = groupOk && resourceOk;
			}

			if (!hasAccess) {
				throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions" });
			}
			// create
			database.group.create({
				data: {
					name,
					parentId,
					permissions: { create: permissions },
					members: { create: [...(m ?? []), { userId, role: GroupRole.OWNER }] }
				}
			});
		}),
	deleteGroup: authProcedure
		.input(z.object({ groupId: z.string() }))
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
			await database.group.delete({ where: { id: groupId } });
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
		.input(z.object({ groupId: z.string(), newOwnerId: z.string() }))
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
			await database.$transaction([
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
				groupId: z.string(),
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
	// Done by resource owners or website admins
	grantGroupPermission: authProcedure
		.input(z.object({ groupId: z.string(), permission: ResourceAccessSchema }))
		.mutation(async ({ input, ctx }) => {
			const { groupId, permission } = input;
			const userId = ctx.user.id; // grantor
			// check if grantor has FULL access level to that resource (does not need to be in the group)
			let hasAccess = ctx.user.role === "ADMIN";
			let grantorId: string | null = null;
			if (!hasAccess) {
				const { accessLevel, groupId } = await getUserPermission({ userId, ...permission });
				hasAccess = !!accessLevel && greaterOrEqAccessLevel(accessLevel, AccessLevel.FULL);
				grantorId = groupId;
			}
			if (!hasAccess) {
				throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions" });
			}
			// now create new permission
			return await createGroupPermission({ groupId, grantorId, ...permission });
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
				// Do not need to check grantorId as they must have FULL access
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
		.input(z.object({ userId: z.string(), groupId: z.string() }))
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
		})
});
