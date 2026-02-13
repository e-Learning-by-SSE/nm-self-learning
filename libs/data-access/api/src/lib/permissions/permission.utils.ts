import { AccessLevel, GroupRole } from "@prisma/client";

export async function anyTrue(promises: (() => Promise<boolean>)[]) {
	for (const fn of promises) {
		if (await fn()) return true;
	}
	return false;
}

// async function adminOrAny(
// 	ctx: { user: { role: string; id: string } },
// 	checks: Array<(userId: string) => Promise<boolean>>
// ): Promise<boolean> {
// 	if (ctx.user.role === "ADMIN") return true;

// 	for (const check of checks) {
// 		if (await check(ctx.user.id)) return true;
// 	}

// 	return false;
// }

const accessLevelHierarchy: Record<AccessLevel, number> = {
	VIEW: 1,
	EDIT: 2,
	FULL: 3
};

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

const groupRoleHierarchy: Record<GroupRole, number> = {
	MEMBER: 2,
	ADMIN: 3
};

export function greaterOrEqGroupRole(a: GroupRole, b: GroupRole): boolean {
	return groupRoleHierarchy[a] >= groupRoleHierarchy[b];
}
