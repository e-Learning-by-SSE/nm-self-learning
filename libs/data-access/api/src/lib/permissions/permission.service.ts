import { database } from "@self-learning/database";
import { AccessLevel, GroupRole } from "@prisma/client";
import {
	MembershipInput,
	PermissionInput,
	ResourceAccess,
	ResourceInput,
	ResourceInputSchema
} from "./permission.types";
import {
	greaterAccessLevel,
	greaterOrEqAccessLevel,
	greaterOrEqGroupRole
} from "./permission.utils";
import { add } from "date-fns";
import { UserFromSession } from "../trpc/context";
import { TRPCError } from "@trpc/server";

/**
 * Readme
 *
 * Working with user permissions in the best scenario should be limited to these 6 functions
 * - @see canCreate
 * - @see canRead (always true for now)
 * - @see canEdit
 * - @see canDelete
 * - @see hasEffectiveAccess check if user has @see AccessLevel or higher
 * - @see getEffectiveAccess allows to get exact @see AccessLevel
 *
 * They all accept @see UserFromSession and @see ResourceInput
 *
 * If more sophisticated functionality is required - see functions below
 *
 * Other stuff may be available in permission.router.tsx
 */

/**
 * Ensures that user can read a specified resource (has VIEW+ access)
 * @note TODO for now all can read
 * @param user - user from session (ctx.user)
 * @param resource - defined resource following ResourceInputSchema
 * @returns `true` if can read specified resource
 */
async function canRead(user: UserFromSession, resource: ResourceInput): Promise<boolean> {
	return true;
	// return hasEffectiveResourceAccess(user, resource, AccessLevel.VIEW );
}

/**
 * Ensures that user can edit a specified resource (has EDIT+ access)
 * @param user - user from session (ctx.user)
 * @param resource - defined resource following ResourceInputSchema
 * @returns `true` if can edit specified resource
 */
export async function canEdit(user: UserFromSession, resource: ResourceInput): Promise<boolean> {
	return hasEffectiveAccess(user, resource, AccessLevel.EDIT);
}

/**
 * Ensures that user can delete a specified resource (has FULL+ access)
 * @param user - user from session (ctx.user)
 * @param resource - defined resource following ResourceInputSchema
 * @returns `true` if can delete specified resource
 */
export async function canDelete(user: UserFromSession, resource: ResourceInput): Promise<boolean> {
	return hasEffectiveAccess(user, resource, AccessLevel.FULL);
}

/**
 * Ensures that user can create a resource
 * @note any group user can create lessons
 * @param user - user from session (ctx.user)
 * @returns `true` if can create a resource
 */
export async function canCreate(user: UserFromSession): Promise<boolean> {
	if (user.role === "ADMIN") return true;
	const canCreate = await database.member.findFirst({
		where: {
			userId: user.id
		},
		select: { userId: true } // do not select unnecessary data
	});
	return !!canCreate;
}

/**
 * "Effective" access means:
 * - ADMIN users are treated as having FULL access
 * - group-derived permissions are resolved
 * - the highest applicable access level is returned
 */

/**
 * A shortcut for @see hasResourceAccess
 * checks if the user is a website admin or has defined access to a specific resource.
 * @param ctx - trpc context with user information
 * @param input - resource input
 * @param accessLevel - required resource access level
 * @returns `true` if user is website admin or has access to the resource at specified access level
 */
export async function hasEffectiveAccess(
	user: UserFromSession,
	resource: ResourceInput,
	accessLevel: AccessLevel
) {
	if (user.role === "ADMIN") return true;
	return await hasResourceAccess({ userId: user.id, accessLevel, ...resource });
}

/**
 * A shortcut for @see hasResourceAccessBatch
 * Checks if the user is a website admin or has defined access to all specified resources.
 * @param ctx - trpc context with user information
 * @param checks - Array of resource access checks
 * @returns - `true` if user is website admin or has access to all resources at specified access levels
 */
export async function hasEffectiveResourceAccessBatch(
	user: UserFromSession,
	checks: ResourceAccess[]
) {
	if (user.role === "ADMIN") return true;
	return await hasResourceAccessBatch(user.id, checks);
}

/**
 * A shortcut for @see hasResourceAccess
 * checks if the user is a website admin or has defined access to a specific resource.
 * @param ctx - trpc context with user information
 * @param input - resource access check
 * @returns `true` if user is website admin or has access to the resource at specified access level
 */
export async function hasEffectiveResourceAccess(user: UserFromSession, input: ResourceAccess) {
	if (user.role === "ADMIN") return true;
	return await hasResourceAccess({ userId: user.id, ...input });
}

/**
 * A shortcut for @see getResourceAccess
 * Fetches the effective access level a user has for a given resource, or FULL if user is website admin.
 * @param ctx - trpc context with user information
 * @param input - resource to get access level for
 * @returns the best access level the user has for the resource + groupId via which access is given;
 * FULL level if user is admin + groupId = null
 * null level if no access
 */
export async function getEffectiveAccess(user: UserFromSession, input: ResourceInput) {
	if (user.role === "ADMIN") return { accessLevel: AccessLevel.FULL, groupId: null };
	return await getResourceAccess({ userId: user.id, ...input });
}

/**
 * A shortcut for @see hasGroupRole
 * Checks if the user is a website admin or has at least the specified role within a group.
 * @param ctx - trpc context with user information
 * @param groupId - ID of the group where to check role
 * @param role - minimum role required
 * @returns true if user is website admin or has at least the specified role in the group
 */
export async function hasEffectiveGroupRole(
	user: UserFromSession,
	groupId: number,
	role: GroupRole
) {
	if (user.role === "ADMIN") return true;
	return await hasGroupRole(groupId, user.id, role);
}

/**
 * Creates a permission entry for a group on a specific resource.
 * @param groupId - ID of the group to assign permission to
 * @param accessLevel - Access level to assign
 * @param courseId - ID of the course resource
 * @param lessonId - ID of the lesson resource
 * @returns permission record created
 */
export async function createResourceAccess(params: PermissionInput) {
	// TODO make log of permission created
	return await database.permission.create({ data: params });
}

/**
 * Fetches the best access level a user has for a given resource.
 * Set either courseId or lessonId
 * @param userId - ID of the user to check access for
 * @param courseId - ID of the course resource
 * @param lessonId - ID of the lesson resource
 * @returns the best access level + groupId via which access is given, or null level if no access
 */
export async function getResourceAccess({
	userId,
	courseId,
	lessonId
}: { userId: string } & ResourceInput) {
	const date = new Date();
	// Find membership
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

/**
 * Bulk check if user has access to multiple resources.
 * @param userId - ID of the user to check access for
 * @param checks - Array of resource access checks
 * @returns `true` if user has access to all resources at specified access levels
 */
export async function hasResourceAccessBatch(userId: string, checks: ResourceAccess[]) {
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
	// separate to avoid id conflicts
	const lessons: Record<string, AccessLevel> = {};
	const courses: Record<string, AccessLevel> = {};

	// Compute best access per resource
	for (const perm of perms) {
		const target = perm.courseId ? courses : lessons;
		const key = perm.courseId ?? perm.lessonId;
		if (!key) continue; // should not happen
		if (!target[key] || greaterAccessLevel(perm.accessLevel, target[key])) {
			target[key] = perm.accessLevel;
		}
	}
	// Run checks
	return checks.every(check => {
		const target = check.courseId ? courses : lessons;
		const key = check.courseId ?? check.lessonId;
		if (!key) return; // should not happen
		return !!target[key] && greaterOrEqAccessLevel(target[key], check.accessLevel);
	});
}

/**
 * Pefrorms a single resource access check for a user.
 * For bulk checks use `hasResourcesAccess`.
 * @param userId - ID of the user to check access for
 * @param accessLevel - Required access level
 * @param courseId - ID of the course resource
 * @param lessonId - ID of the lesson resource
 * @returns `true` if user has required access level or better for the resource
 */
export async function hasResourceAccess(
	params: { userId: string; accessLevel: AccessLevel } & ResourceInput
) {
	const { accessLevel: actualLevel } = await getResourceAccess(params);
	if (!actualLevel) return false;
	return greaterOrEqAccessLevel(actualLevel, params.accessLevel);
}

//---------------------------------------------------------------------------

/**
 * Creates a group membership for a user with an optional expiration.
 * @param groupId - ID of the group where membership is created
 * @param userId - ID of the user to create membership for
 * @param role - Role to assign to the user in the group
 * @param durationMinutes - [Optional] duration in minutes after which the membership expires
 * @returns the created membership record
 */
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

/**
 * Retrieves the role of a user within a group.
 * @param groupId - group ID where to get role
 * @param userId - user ID to check role for
 * @returns group role of user or null if no membership
 */
export async function getGroupRole(groupId: number, userId: string) {
	const access = await database.member.findFirst({
		where: { userId, groupId, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
		select: { role: true }
	});
	return access?.role ?? null;
}

/**
 * Checks if a user has at least a specified role within a group.
 * @param groupId -group ID where to check role
 * @param userId - user ID to check role for
 * @param role - minimum role required
 * @returns `true` if user has at least the specified role in the group
 */
export async function hasGroupRole(groupId: number, userId: string, role: GroupRole) {
	const groupRole = await getGroupRole(groupId, userId);
	return !!groupRole && greaterOrEqGroupRole(groupRole, role);
}

/**
 * fetches detailed information about a group, including its permissions and members.
 * @param groupId - ID of the group to fetch
 * @returns detailed information about a group, including its permissions and members
 */
export async function getGroup(groupId: number) {
	return await database.group.findUnique({
		where: { id: groupId },
		select: {
			id: true,
			parent: { select: { id: true, name: true } },
			name: true,
			slug: true,
			children: { select: { id: true, name: true } },
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

/**
 * Fetches all resources FULL owned by a single group.
 * @param groupId - ID of the group to check
 * @returns a list of resources FULL owned by the group
 */
export async function getSingleOwnedResources(groupId: number) {
	return await database.permission.findMany({
		where: {
			groupId,
			accessLevel: AccessLevel.FULL,
			OR: [
				{
					course: {
						permissions: {
							none: { accessLevel: AccessLevel.FULL, NOT: { groupId } }
						}
					}
				},
				{
					lesson: {
						permissions: {
							none: { accessLevel: AccessLevel.FULL, NOT: { groupId } }
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
}

/**
 * Tests whether group with groupId is an ancestor of itself
 * @param groupId - id of a group to test
 * @param parentId - direct parent group id
 * @returns `true` if circular dependency detected
 */
export async function testGroupCircularParent(groupId: number, parentId: number) {
	let currentId: number | null = parentId;
	// run through parents
	while (currentId !== null) {
		if (currentId === groupId) {
			return true;
		}
		const parent: { parentId: null | number } | null = await database.group.findUnique({
			where: { id: currentId },
			select: { parentId: true }
		});

		currentId = parent?.parentId ?? null;
	}
	return false;
}

type PermissionOfResource = {
	groupId: number;
	accessLevel: AccessLevel;
};

export type PermissionsForCreate = Awaited<ReturnType<typeof preparePermissionsForCreate>>;
export type PermissionsForUpdate = Awaited<ReturnType<typeof preparePermissionsForUpdate>>;

/**
 * Every resource has permissions array. If that array was created through create trpc
 * this method helps to perform necessary checks to create permissions
 * @note Checks if permissions are to be changed:
 * @param newPermissions - list of created permissions
 * @throws TRPCError if permissions do not follow the schema
 * @returns db create ready json
 */
export async function preparePermissionsForCreate(newPermissions: PermissionOfResource[]) {
	// make sure at least one permission is FULL
	if (newPermissions.filter(p => p.accessLevel === AccessLevel.FULL).length === 0) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "requires at least one FULL permission."
		});
	}
	//
	return {
		create: newPermissions.map(p => ({
			accessLevel: p.accessLevel,
			groupId: p.groupId
		}))
	};
}

/**
 * Every resource has permissions array. If that array was modified through update trpc
 * this method helps to perform necessary checks to update permissions
 * Usage inside transaction is possible
 * @note Checks if permissions are to be changed:
 * If changed: Requires FULL access
 * If not changed: Requires EDIT access
 * @param resource - @see ResourceInput - specifies resource permissions are attached to
 * @param newPermissions - list of edited permissions
 * @throws TRPCError if permissions or resource do not follow the schema
 * @returns db upsert ready json or undefined (if no changes are required)
 */
export async function preparePermissionsForUpdate(
	resource: ResourceInput,
	newPermissions: PermissionOfResource[]
) {
	// safe parse input (as its used in where clause)
	const validation = ResourceInputSchema.safeParse(resource);
	if (!validation.success) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "Invalid resource identifiers provided.",
			cause: validation.error
		});
	}
	resource = validation.data;
	// drop display fields
	const perms = newPermissions.map(p => {
		return {
			accessLevel: p.accessLevel,
			groupId: p.groupId
		};
	});
	// make sure at least one permission is FULL
	if (perms.filter(p => p.accessLevel === AccessLevel.FULL).length === 0) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "requires at least one FULL permission."
		});
	}
	// fetch existing permissions to determine diffs
	const existingPerms = await database.permission.findMany({
		where: resource,
		select: { groupId: true, lessonId: true, accessLevel: true }
	});
	// compute if permissions are equal
	const toKey = (p: PermissionOfResource) => `${p.groupId}|${p.accessLevel}`;
	const keys = new Set(perms.map(toKey));
	const equal =
		existingPerms.length === perms.length && existingPerms.every(ep => keys.has(toKey(ep)));
	// no update required
	if (equal) {
		return undefined;
	}
	// TODO make this through common base
	const getUpsertWhere = (p: PermissionOfResource) => {
		if (resource.lessonId) {
			return {
				groupId_lessonId: {
					groupId: p.groupId,
					lessonId: resource.lessonId
				}
			};
		}
		if (resource.courseId) {
			return {
				groupId_courseId: {
					groupId: p.groupId,
					courseId: resource.courseId
				}
			};
		}
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "invalid resource input."
		});
	};

	return {
		deleteMany: { groupId: { notIn: perms.map(p => p.groupId) } },
		upsert: perms.map(p => ({
			where: getUpsertWhere(p),
			create: p,
			update: {
				accessLevel: p.accessLevel
			}
		}))
	};
}
