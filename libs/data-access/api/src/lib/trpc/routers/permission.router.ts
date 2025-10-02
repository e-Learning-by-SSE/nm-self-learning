import { database } from "@self-learning/database";
import { z } from "zod";
import { adminProcedure, authProcedure, t } from "../trpc";
import { add } from "date-fns";
import { TRPCError } from "@trpc/server";
import { AccessLevel } from "@prisma/client";

export const PermissionResourceEnum = z.enum(["SUBJECT", "COURSE", "LESSON"]);
export type PermissionResourceType = z.infer<typeof PermissionResourceEnum>;

export const AccessLevelEnum = z.nativeEnum(AccessLevel);
const accessLevelHierarchy: Record<AccessLevel, number> = {
	VIEW: 1,
	EDIT: 2,
	FULL: 3
};

export const PermissionBase = z.object({
	userId: z.string().uuid(),
	accessLevel: AccessLevelEnum,
	expiresAt: z.date().nullable(),
	subjectId: z.string().optional(),
	courseId: z.string().optional(),
	lessonId: z.string().optional()
});
export type PermissionBaseType = z.infer<typeof PermissionBase>;

export async function getUserPermission(
	userId: string,
	resourceType: PermissionResourceType,
	resourceId: string
) {
	let lessonId: string | null = null;
	let courseId: string | null = null;
	let subjectId: string | null = null;

	// determine resource type
	switch (resourceType) {
		case PermissionResourceEnum.Enum.LESSON: {
			const lesson = await database.lesson.findUnique({
				where: { lessonId: resourceId },
				select: {
					lessonId: true,
					course: {
						select: {
							courseId: true,
							subjectId: true
						}
					}
				}
			});
			if (!lesson) return { accessLevel: null };
			lessonId = lesson.lessonId;
			courseId = lesson.course?.courseId || null;
			subjectId = lesson.course?.subjectId || null;
			break;
		}
		case PermissionResourceEnum.Enum.COURSE: {
			const course = await database.course.findUnique({
				where: { courseId: resourceId },
				select: {
					courseId: true,
					subjectId: true
				}
			});
			if (!course) return { accessLevel: null };
			courseId = course.courseId;
			subjectId = course.subjectId;
			break;
		}
		case PermissionResourceEnum.Enum.SUBJECT: {
			subjectId = resourceId;
			break;
		}
	}

	const date = new Date();
	// Check permissions in one transaction
	const [lessonPerm, coursePerm, subjectPerm] = await database.$transaction([
		database.permission.findFirst({
			where: { userId, lessonId, expiresAt: { gt: date } }
		}),
		database.permission.findFirst({
			where: { userId, courseId, expiresAt: { gt: date } }
		}),
		database.permission.findFirst({
			where: { userId, subjectId, expiresAt: { gt: date } }
		})
	]);

	// Access Level resolution -> Return bottom-most accessLevel
	// This approach allows to determine the closest propper permission:
	// in a chain FULL - EDIT - NULL will return FULL for lesson
	// allows narrowing permissions: chain NULL - READ - FULL will return READ for lesson
	const permission = lessonPerm ?? coursePerm ?? subjectPerm ?? null;

	return {
		accessLevel: permission?.accessLevel ?? null
	};
}

export async function hasAccessLevel(
	userId: string,
	resourceType: PermissionResourceType,
	resourceId: string,
	accessLevel: AccessLevel
) {
	const { accessLevel: actualLevel } = await getUserPermission(userId, resourceType, resourceId);
	if (!actualLevel) return false;
	return accessLevelHierarchy[actualLevel] >= accessLevelHierarchy[accessLevel];
}

export async function createUserPermission(
	userId: string,
	resourceType: PermissionResourceType,
	resourceId: string,
	accessLevel: AccessLevel,
	durationMinutes?: number
) {
	const now = new Date();
	const expiresAt =
		typeof durationMinutes === "number" ? add(now, { minutes: durationMinutes }) : null;

	// build data object
	const data: PermissionBaseType = { userId, accessLevel, expiresAt };

	if (resourceType === "SUBJECT") data.subjectId = resourceId;
	if (resourceType === "COURSE") data.courseId = resourceId;
	if (resourceType === "LESSON") data.lessonId = resourceId;

	try {
		return await database.permission.create({ data });
	} catch (error) {
		if (error instanceof TRPCError) {
			throw error;
		}

		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "Failed to create new permission"
		});
	}
}

export const permissionRouter = t.router({
	create: adminProcedure
		.input(
			z.object({
				resourceType: PermissionResourceEnum,
				resourceId: z.string(),
				accessLevel: AccessLevelEnum,
				durationMinutes: z.number().optional()
			})
		)
		.mutation(async ({ input, ctx }) => {
			const { resourceType, resourceId, accessLevel, durationMinutes } = input;
			const userId = ctx.user.id;

			return await createUserPermission(
				userId,
				resourceType,
				resourceId,
				accessLevel,
				durationMinutes
			);
		}),
	get: authProcedure
		.input(z.object({ resourceType: PermissionResourceEnum, resourceId: z.string() }))
		.query(async ({ input, ctx }) => {
			const { resourceType, resourceId } = input;
			const userId = ctx.user.id;
			return await getUserPermission(userId, resourceType, resourceId);
		}),
	hasAccessLevel: authProcedure
		.input(
			z.object({
				resourceType: PermissionResourceEnum,
				resourceId: z.string(),
				accessLevel: AccessLevelEnum
			})
		)
		.query(async ({ input, ctx }) => {
			if (ctx.user.role === "ADMIN") return true;
			const { resourceType, resourceId, accessLevel } = input;
			return await hasAccessLevel(ctx.user.id, resourceType, resourceId, accessLevel);
		}),
	grant: authProcedure
		.input(
			z.object({
				resourceType: PermissionResourceEnum,
				resourceId: z.string(),
				accessLevel: AccessLevelEnum,
				durationMinutes: z.number().optional()
			})
		)
		.mutation(async ({ input, ctx }) => {
			const { resourceType, resourceId, accessLevel, durationMinutes } = input;
			const userId = ctx.user.id; // grantor
			// first check if grantor has FULL permission
			const hasAccess =
				ctx.user.role === "ADMIN" ||
				(await hasAccessLevel(userId, resourceType, resourceId, AccessLevel.FULL));
			if (!hasAccess) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Insufficient permissions"
				});
			}
			// now create new permission
			return await createUserPermission(
				userId,
				resourceType,
				resourceId,
				accessLevel,
				durationMinutes
			);
			// TODO make log of permission created
		}),
	revoke: authProcedure
		.input(
			z.object({
				permissionId: z.string()
			})
		)
		.mutation(async ({ input, ctx }) => {
			const { permissionId } = input;
			const userId = ctx.user.id;
			// fetch permission which is revoked
			const perm = await database.permission.findUnique({
				where: { id: permissionId },
				select: {
					lessonId: true,
					subjectId: true,
					courseId: true
				}
			});
			if (!perm) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Invalid permission"
				});
			}
			let resourceId: string;
			let resourceType: PermissionResourceType | null = null;
			if (perm.lessonId) {
				resourceType = PermissionResourceEnum.Enum.LESSON;
				resourceId = perm.lessonId;
			} else if (perm.courseId) {
				resourceType = PermissionResourceEnum.Enum.COURSE;
				resourceId = perm.courseId;
			} else if (perm.subjectId) {
				resourceType = PermissionResourceEnum.Enum.SUBJECT;
				resourceId = perm.subjectId;
			} else {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Invalid permission"
				});
			}
			// check if user has FULL access level to that resource
			const hasAccess =
				ctx.user.role === "ADMIN" ||
				(await hasAccessLevel(userId, resourceType, resourceId, AccessLevel.FULL));
			if (!hasAccess) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Insufficient permissions"
				});
			}
			// delete permission
			return await database.permission.delete({
				where: {
					id: permissionId,
					userId: userId
				}
			});
			// TODO make log of permission revoked
		}),
	delete: adminProcedure
		.input(
			z.object({
				permissionId: z.string()
			})
		)
		.mutation(async ({ input, ctx }) => {
			const { permissionId } = input;
			const userId = ctx.user.id; // grantor
			return await database.permission.delete({
				where: {
					id: permissionId,
					userId: userId
				}
			});
		})
});
