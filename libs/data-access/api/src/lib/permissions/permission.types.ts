import { z } from "zod";
import { AccessLevel, GroupRole } from "@prisma/client";

export const AccessLevelEnum = z.enum(AccessLevel);
export const GroupRoleEnum = z.enum(GroupRole);

export const ResourceInputSchema = z
	.object({
		courseId: z.string().nullable().optional(),
		lessonId: z.string().nullable().optional(),
		specializationId: z.string().nullable().optional(),
		subjectId: z.string().nullable().optional()
	})
	.refine(
		p => {
			const resources = [p.courseId, p.lessonId, p.specializationId, p.subjectId];
			const providedResources = resources.filter(Boolean);
			return providedResources.length === 1;
		},
		{
			message: "Exactly one resource must be provided"
		}
	)
	.transform(data => {
		if (data.courseId) return { courseId: data.courseId };
		if (data.lessonId) return { lessonId: data.lessonId };
		if (data.specializationId) return { specializationId: data.specializationId };
		if (data.subjectId) return { subjectId: data.subjectId };
		throw new Error("Invalid resource input");
	});
export type ResourceInput = z.infer<typeof ResourceInputSchema>;

export const ResourceAccessSchema = z
	.object({
		courseId: z.string().nullable().optional(),
		lessonId: z.string().nullable().optional(),
		specializationId: z.string().nullable().optional(),
		subjectId: z.string().nullable().optional(),
		accessLevel: AccessLevelEnum
	})
	.refine(
		p => {
			const resources = [p.courseId, p.lessonId, p.specializationId, p.subjectId];
			const providedResources = resources.filter(Boolean);
			return providedResources.length === 1;
		},
		{
			message: "Exactly one resource must be provided"
		}
	)
	.transform(data => {
		if (data.courseId) return { courseId: data.courseId, accessLevel: data.accessLevel };
		if (data.lessonId) return { lessonId: data.lessonId, accessLevel: data.accessLevel };
		if (data.specializationId)
			return { specializationId: data.specializationId, accessLevel: data.accessLevel };
		if (data.subjectId) return { subjectId: data.subjectId, accessLevel: data.accessLevel };
		throw new Error("Invalid resource input");
	});

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
