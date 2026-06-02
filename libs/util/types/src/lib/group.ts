import { GroupRole } from "@prisma/client";
import { z } from "zod";
import { add } from "date-fns";
import { ResourceAccessFormSchema } from "./resource";
import { GroupRoleEnum } from "./permissions";

// === backend

export const MembershipInputSchema = z.object({
	groupId: z.number(),
	expiresAt: z.date().nullable(),
	userId: z.string(),
	role: GroupRoleEnum
});
export type MembershipInput = z.infer<typeof MembershipInputSchema>;

// === merging

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

export const MemberFormSchema = z.object({
	role: z.enum(GroupRole),
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

// ===

export function computeExpiresAt(durationMinutes: number): Date {
	const now = new Date();
	return add(now, { minutes: durationMinutes });
}

// === group ui

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

// Display Group Entry
export const GroupEntrySchema = z.object({
	id: z.number(),
	name: z.string(),
	slug: z.string().nullable()
});
export type GroupEntry = z.infer<typeof GroupEntrySchema>;
