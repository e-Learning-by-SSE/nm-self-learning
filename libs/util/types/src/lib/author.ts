import { GroupRole } from "@prisma/client";
import { z } from "zod";

export const GroupRoleEnum = z.nativeEnum(GroupRole);

export const membershipSchema = z.object({
	groupId: z.number(),
	expiresAt: z.date().nullable(),
	userId: z.string(),
	role: GroupRoleEnum
});

export const authorSchema = z.object({
	displayName: z.string().min(3),
	slug: z.string().min(3),
	imgUrl: z.string().url().nullable(),
	memberships: z.array(membershipSchema)
});

/**
 * This schema can be used to validate the author relations in another schema
 *
 * @example
 * export const courseFormSchema = z.object({
 *		slug: z.string().min(3),
 *		title: z.string().min(3),
 *		description: z.string().nullable(),
 *		authors: authorsRelationSchema,
 * });
 */
export const authorsRelationSchema = z.array(z.object({ username: z.string() }));

export type Author = z.infer<typeof authorSchema>;
