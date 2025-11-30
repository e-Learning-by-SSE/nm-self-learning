import { AccessLevel } from "@prisma/client";
import { z } from "zod";
import { GroupRoleEnum } from "./author";
import { add } from "date-fns";

export const test = z.object({
	id: z.string().uuid().optional()
});

// TODO copied from permission.router.ts
export const AccessLevelEnum = z.nativeEnum(AccessLevel);
export const ResourceAccessFormSchema = z.union([
	z.object({
		accessLevel: AccessLevelEnum,
		course: z.object({ courseId: z.string(), slug: z.string(), title: z.string() }),
		lesson: z.null().optional()
	}),
	z.object({
		accessLevel: AccessLevelEnum,
		lesson: z.object({ lessonId: z.string(), slug: z.string(), title: z.string() }),
		course: z.null().optional()
	})
]);
export const MemberFormSchema = z.object({
	role: GroupRoleEnum,
	expiresAt: z.coerce.date().nullable(),
	user: z.object({
		id: z.string(),
		displayName: z.string().nullable(),
		email: z.string().email().nullable(),
		author: z.object({ id: z.number() }).nullable()
	})
});

export type ResourceAccessFormType = z.infer<typeof ResourceAccessFormSchema>;

// compute expiredAt
// const m = members?.map(m => {
//     const now = new Date();
//     const expiresAt =
//         typeof m.durationMinutes === "number"
//             ? add(now, { minutes: m.durationMinutes })
//             : null;
//     return { userId: m.userId, role: m.role, expiresAt };
// });

export function computeExpiresAt(durationMinutes: number): Date {
	const now = new Date();
	return add(now, { minutes: durationMinutes });
}

// z.object({
// 				parentId: z.string().nullable(),
// 				name: z.string(),
// 				permissions: ResourceAccessSchema.array(),
// 				members: z
// 					.object({
// 						userId: z.string(),
// 						role: GroupRoleEnum,
// 						expiresAt: z.date().optional()
// 					})
// 					.array()
// 					.optional()
// 			})

export const GroupFormSchema = z.object({
	id: z.number().nullable(),
	parent: z
		.object({
			id: z.number(),
			name: z.string()
		})
		.nullable(),
	name: z.string().min(3),
	permissions: ResourceAccessFormSchema.array(),
	members: MemberFormSchema.array()
	// TODO: also grants
});

export type Group = z.infer<typeof GroupFormSchema>;
export type Member = z.infer<typeof MemberFormSchema>;

/** Returns a {@link Group} object with empty/null values.  */
export function createEmptyGroup(): Group {
	return {
		id: null,
		parent: null,
		name: "",
		permissions: [],
		members: []
	};
}

// Group Access
export type GroupAccess = {
	groupId: number;
	accessLevel: AccessLevel;
	grantorId: number | null;
};

//
const accessLevelHierarchy: Record<AccessLevel, number> = { VIEW: 1, EDIT: 2, FULL: 3 };

export function greaterAccessLevel(a: AccessLevel, b: AccessLevel): boolean {
	return accessLevelHierarchy[a] > accessLevelHierarchy[b];
}
export function greaterOrEqAccessLevel(a: AccessLevel, b: AccessLevel): boolean {
	return accessLevelHierarchy[a] >= accessLevelHierarchy[b];
}
