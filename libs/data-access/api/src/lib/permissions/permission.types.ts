import { z } from "zod";
import { AccessLevel, GroupRole } from "@prisma/client";

export const AccessLevelEnum = z.nativeEnum(AccessLevel);
export const GroupRoleEnum = z.nativeEnum(GroupRole);

export const ResourceInputSchema = z.union([
	z.object({ courseId: z.string(), lessonId: z.never().optional().nullable() }),
	z.object({ lessonId: z.string(), courseId: z.never().optional().nullable() })
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
