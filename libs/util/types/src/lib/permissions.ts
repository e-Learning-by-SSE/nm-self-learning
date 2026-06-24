import { AccessLevel, GroupRole, Prisma } from "@prisma/client";
import z from "zod";
import type { ResourceInput } from "./resource";

export type PermissionInput = {
	groupId: number;
	accessLevel: AccessLevel;
} & ResourceInput;

export const resourcePermissionSelect = {
	accessLevel: true,
	group: {
		select: {
			id: true,
			name: true
		}
	}
} as const satisfies Prisma.PermissionSelect;

export type PrismaResourcePermission = Prisma.PermissionGetPayload<{
	select: typeof resourcePermissionSelect;
}>;

// ===
export const AccessLevelEnum = z.enum(AccessLevel);
const accessLevelHierarchy: Record<AccessLevel, number> = { VIEW: 1, EDIT: 2, FULL: 3 };

//const AccessLevelOpt = AccessLevelEnum.nullish();
//type AccessLevelOpt = z.infer<typeof AccessLevelOpt>;

/**
 * tests if access level a is greater than access level b
 * @param a
 * @param b
 * @returns - true if a > b
 */
export function greaterAccessLevel(a: AccessLevel, b: AccessLevel): boolean {
	return accessLevelHierarchy[a] > accessLevelHierarchy[b];
}

/**
 * tests if access level a is greater than or equal to access level b
 * @param a
 * @param b
 * @returns - true if a >= b
 */
export function greaterOrEqAccessLevel(a: AccessLevel, b: AccessLevel): boolean {
	return accessLevelHierarchy[a] >= accessLevelHierarchy[b];
}

export function bestAccessLevel(a: AccessLevel, b: AccessLevel): AccessLevel {
	return greaterAccessLevel(a, b) ? a : b;
}

export function worstAccessLevel(a: AccessLevel, b: AccessLevel): AccessLevel {
	return greaterAccessLevel(a, b) ? b : a;
}

// ===
export const GroupRoleEnum = z.enum(GroupRole);
const groupRoleHierarchy: Record<GroupRole, number> = {
	MEMBER: 2,
	ADMIN: 3
};

export function greaterOrEqGroupRole(a: GroupRole, b: GroupRole): boolean {
	return groupRoleHierarchy[a] >= groupRoleHierarchy[b];
}

export function greaterGroupRole(a: GroupRole, b: GroupRole): boolean {
	return groupRoleHierarchy[a] > groupRoleHierarchy[b];
}

export function bestGroupRole(a: GroupRole, b: GroupRole): GroupRole {
	return greaterGroupRole(a, b) ? a : b;
}

export function worstGroupRole(a: GroupRole, b: GroupRole): GroupRole {
	return greaterGroupRole(a, b) ? b : a;
}
