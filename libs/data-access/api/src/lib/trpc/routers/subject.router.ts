import { database } from "@self-learning/database";
import { resourcePermissionSelect, subjectSchema } from "@self-learning/types";
import { z } from "zod";
import { adminProcedure, authProcedure, t } from "../trpc";
import {
	canDelete,
	canEdit,
	hasResourceAccess,
	preparePermissionsForCreate,
	prepareResourceUpdate
} from "../../permissions/permission.service";
import { TRPCError } from "@trpc/server";
import { UserFromSession } from "../context";
import { AccessLevel } from "@prisma/client";

const courseAttachmentSchema = z.object({
	subjectId: z.string(),
	courseId: z.string()
});
type CourseAttachmentType = z.infer<typeof courseAttachmentSchema>;

async function canAttachCourse(user: UserFromSession, input: CourseAttachmentType) {
	// Is website ADMIN or ( full(course) ^ edit(subject) )
	if (user.role === "ADMIN") {
		return true;
	}
	const { courseId, subjectId } = input;
	const hasCourseAccess = await hasResourceAccess(user.id, {
		accessLevel: AccessLevel.FULL,
		courseId
	});
	const hasSbAccess = await hasResourceAccess(user.id, {
		accessLevel: AccessLevel.EDIT,
		subjectId
	});
	return hasCourseAccess && hasSbAccess;
}

const specializationAttachmentSchema = z.object({
	subjectId: z.string(),
	specializationId: z.string()
});
type SpecializationAttachmentType = z.infer<typeof specializationAttachmentSchema>;

async function canAttachSpecialization(user: UserFromSession, input: SpecializationAttachmentType) {
	// Is website ADMIN or ( full(specialization) ^ edit(subject) )
	if (user.role === "ADMIN") {
		return true;
	}
	const { specializationId, subjectId } = input;
	const hasSpAccess = await hasResourceAccess(user.id, {
		accessLevel: AccessLevel.FULL,
		specializationId
	});
	const hasSbAccess = await hasResourceAccess(user.id, {
		accessLevel: AccessLevel.EDIT,
		subjectId
	});
	return hasSbAccess && hasSpAccess;
}

export const subjectRouter = t.router({
	getAllWithSpecializations: t.procedure.query(() => {
		return database.subject.findMany({
			orderBy: { title: "asc" },
			select: {
				subjectId: true,
				title: true,
				specializations: {
					orderBy: { title: "asc" },
					select: { title: true, cardImgUrl: true, specializationId: true }
				}
			}
		});
	}),
	getAllForAdminPage: adminProcedure.query(() => {
		return database.subject.findMany({
			orderBy: { title: "asc" },
			select: {
				subjectId: true,
				title: true,
				subtitle: true,
				cardImgUrl: true,
				permissions: {
					select: resourcePermissionSelect
				},
				_count: { select: { courses: true, specializations: true } }
			}
		});
	}),
	getAllSubjects: t.procedure.query(() => {
		return database.subject.findMany({
			select: {
				subjectId: true,
				title: true
			}
		});
	}),
	getForEdit: authProcedure.input(z.object({ subjectId: z.string() })).query(({ input }) => {
		return database.subject.findUniqueOrThrow({
			where: { subjectId: input.subjectId },
			select: {
				subjectId: true,
				slug: true,
				title: true,
				subtitle: true,
				cardImgUrl: true,
				imgUrlBanner: true,
				permissions: {
					select: resourcePermissionSelect
				},
				specializations: {
					orderBy: { title: "asc" },
					select: {
						specializationId: true,
						title: true,
						subtitle: true,
						cardImgUrl: true,
						permissions: {
							select: resourcePermissionSelect
						}
					}
				}
			}
		});
	}),
	create: adminProcedure.input(subjectSchema).mutation(async ({ input }) => {
		// prepare permissions for create (can throw)
		const permissions = await preparePermissionsForCreate(input.permissions);
		// only for admins
		const subject = await database.subject.create({
			data: {
				subjectId: input.slug,
				title: input.title,
				slug: input.slug,
				subtitle: input.subtitle,
				cardImgUrl: input.cardImgUrl,
				imgUrlBanner: input.imgUrlBanner,
				permissions
			}
		});

		console.log("[subjectRouter.create]: Subject created", {
			subjectId: subject.subjectId,
			slug: subject.slug,
			title: subject.title
		});

		return subject;
	}),
	update: authProcedure.input(subjectSchema).mutation(async ({ ctx, input }) => {
		const permissions = await prepareResourceUpdate(ctx.user, input, input.permissions);
		return database.subject.update({
			where: { subjectId: input.subjectId },
			data: {
				title: input.title,
				slug: input.slug,
				subtitle: input.subtitle,
				cardImgUrl: input.cardImgUrl,
				imgUrlBanner: input.imgUrlBanner,
				permissions
			}
		});
	}),
	deleteSubject: authProcedure
		.input(z.object({ subjectId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const resource = { subjectId: input.subjectId };

			if (!(await canDelete(ctx.user, resource))) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Insufficient permissions."
				});
			}

			return database.subject.delete({
				where: resource,
				select: {
					subjectId: true,
					title: true,
					slug: true
				}
			});
		}),
	findLinkedEntities: authProcedure
		.input(z.object({ subjectId: z.string() }))
		.query(async ({ input, ctx }) => {
			if (!(await canEdit(ctx.user, input))) {
				throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions" });
			}
			return await database.subject.findUnique({
				where: input,
				include: {
					courses: {
						include: {
							permissions: {
								select: {
									accessLevel: true,
									groupId: true
								}
							}
						}
					},
					specializations: {
						include: {
							permissions: {
								select: {
									accessLevel: true,
									groupId: true
								}
							}
						}
					}
				}
			});
		}),
	addCourse: authProcedure.input(courseAttachmentSchema).mutation(async ({ input, ctx }) => {
		if (!(await canAttachCourse(ctx.user, input))) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Insufficient permissions."
			});
		}

		const { courseId, subjectId } = input;

		const added = await database.subject.update({
			where: { subjectId },
			data: { courses: { connect: { courseId } } },
			select: { subjectId: true }
		});

		console.log("[subjectRouter.addCourse]: Course added to subject by", ctx.user.name, {
			subjectId,
			courseId
		});
		return added;
	}),
	removeCourse: authProcedure.input(courseAttachmentSchema).mutation(async ({ input, ctx }) => {
		if (!(await canAttachCourse(ctx.user, input))) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Insufficient permissions."
			});
		}

		const { courseId, subjectId } = input;

		const removed = await database.subject.update({
			where: { subjectId },
			data: { courses: { disconnect: { courseId } } },
			select: { subjectId: true }
		});

		console.log("[subjectRouter.removeCourse]: Course removed from subject by", ctx.user.name, {
			subjectId,
			courseId
		});
		return removed;
	}),
	addSpecialization: authProcedure
		.input(specializationAttachmentSchema)
		.mutation(async ({ input, ctx }) => {
			if (!(await canAttachSpecialization(ctx.user, input))) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Insufficient permissions."
				});
			}

			const { specializationId, subjectId } = input;

			const added = await database.subject.update({
				where: { subjectId },
				data: { specializations: { connect: { specializationId } } },
				select: { subjectId: true }
			});

			console.log(
				"[subjectRouter.addSpecialization]: Specialization added to subject by",
				ctx.user.name,
				{ specializationId, subjectId }
			);
			return added;
		}),
	removeSpecialization: authProcedure
		.input(specializationAttachmentSchema)
		.mutation(async ({ input, ctx }) => {
			if (!(await canAttachSpecialization(ctx.user, input))) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Insufficient permissions."
				});
			}
			const { specializationId, subjectId } = input;

			const removed = await database.subject.update({
				where: { subjectId },
				data: { specializations: { disconnect: { specializationId } } },
				select: { subjectId: true }
			});

			console.log(
				"[subjectRouter.removeSpecialization]: Specialization removed from subject by",
				ctx.user.name,
				{ specializationId, subjectId }
			);
			return removed;
		})
});
