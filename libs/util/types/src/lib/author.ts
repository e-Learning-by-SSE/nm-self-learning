import { z } from "zod";
import { GroupEntrySchema } from "./group";
import { GroupRoleEnum } from "./permissions";

export const membershipSchema = z.object({
	group: GroupEntrySchema,
	expiresAt: z.date().nullable(),
	role: GroupRoleEnum
});

export const authorSchema = z.object({
	displayName: z.string().min(3),
	slug: z.string().min(3),
	imgUrl: z.url().nullable(),
	memberships: z.array(membershipSchema),
	defaultGroupId: z.number().nullable()
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
