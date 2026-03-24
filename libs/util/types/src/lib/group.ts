import { AccessLevel } from "@prisma/client";
import { z } from "zod";
import { GroupRoleEnum } from "./author";
import { add } from "date-fns";

export enum MergeStrategy {
	First = "first",
	Highest = "highest",
	Lowest = "lowest"
}

const MergeGroupEntrySchema = z.object({
	groupId: z.number(),
	name: z.string(),
	slug: z.string().nullable()
});

export const MergeGroupsSchema = z.object({
	name: z.string().min(3),
	slug: z.string().min(3),
	groups: z.array(MergeGroupEntrySchema).min(2),
	strategy: z.enum(MergeStrategy)
});

export type MergeGroupsType = z.infer<typeof MergeGroupsSchema>;

// TODO copied from permission.router.ts
export const AccessLevelEnum = z.enum(AccessLevel);
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
	expiresAt: z.coerce
		.date()
		.nullable()
		.refine(date => !date || date > new Date(), {
			message: "Expiration date must be in the future"
		}) as z.ZodNullable<z.ZodDate>,
	user: z.object({
		id: z.string(),
		displayName: z.string().nullable(),
		email: z.email().nullable(),
		author: z.object({ id: z.number() }).nullable()
	})
});

export type ResourceAccessFormType = z.infer<typeof ResourceAccessFormSchema>;

export function computeExpiresAt(durationMinutes: number): Date {
	const now = new Date();
	return add(now, { minutes: durationMinutes });
}

export const GroupFormSchema = z.object({
	id: z.number().nullable(),
	parent: z
		.object({
			id: z.number(),
			name: z.string()
		})
		.nullable(),
	name: z.string().min(3),
	slug: z.string().min(3),
	permissions: ResourceAccessFormSchema.array(),
	members: MemberFormSchema.array()
});

export type Group = z.infer<typeof GroupFormSchema>;
export type Member = z.infer<typeof MemberFormSchema>;

/** Returns a {@link Group} object with empty/null values.  */
export function createEmptyGroup(): Group {
	return {
		id: null,
		parent: null,
		name: "",
		slug: "",
		permissions: [],
		members: []
	};
}

// Group Access
export type GroupAccess = {
	groupId: number;
	accessLevel: AccessLevel;
};

//
const accessLevelHierarchy: Record<AccessLevel, number> = { VIEW: 1, EDIT: 2, FULL: 3 };

export function greaterAccessLevel(a: AccessLevel, b: AccessLevel): boolean {
	return accessLevelHierarchy[a] > accessLevelHierarchy[b];
}
export function greaterOrEqAccessLevel(a: AccessLevel, b: AccessLevel): boolean {
	return accessLevelHierarchy[a] >= accessLevelHierarchy[b];
}
