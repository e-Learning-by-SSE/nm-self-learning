import { database } from "@self-learning/database";
import { specializationSchema } from "@self-learning/types";
import { z } from "zod";
import { authProcedure, t } from "../trpc";
import {
	canEdit,
	hasResourceAccess,
	preparePermissionsForCreate,
	prepareResourceUpdate
} from "../../permissions/permission.service";
import { TRPCError } from "@trpc/server";
import { AccessLevel } from "@prisma/client";

export const specializationRouter = t.router({
	getById: authProcedure.input(z.object({ specializationId: z.string() })).query(({ input }) => {
		return database.specialization.findUniqueOrThrow({
			where: { specializationId: input.specializationId },
			select: {
				specializationId: true,
				slug: true,
				cardImgUrl: true,
				title: true,
				subject: { select: { subjectId: true, slug: true, title: true } }
			}
		});
	}),
	getForEdit: authProcedure
		.input(z.object({ specializationId: z.string() }))
		.query(({ input }) => {
			return database.specialization.findUniqueOrThrow({
				where: { specializationId: input.specializationId },
				select: {
					specializationId: true,
					subjectId: true,
					slug: true,
					title: true,
					subtitle: true,
					cardImgUrl: true,
					imgUrlBanner: true,
					permissions: {
						select: {
							accessLevel: true,
							group: {
								select: {
									id: true,
									name: true
								}
							}
						}
					}
				}
			});
		}),
	create: authProcedure
		.input(z.object({ subjectId: z.string(), data: specializationSchema }))
		.mutation(async ({ ctx, input }) => {
			// must be able to edit parent subject
			if (!(await canEdit(ctx.user, { subjectId: input.subjectId }))) {
				throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions." });
			}
			// prepare permissions for create (can throw)
			const permissions = await preparePermissionsForCreate(input.data.permissions);

			const specialization = await database.specialization.create({
				data: {
					subjectId: input.subjectId,
					specializationId: input.data.slug,
					title: input.data.title,
					slug: input.data.slug,
					subtitle: input.data.subtitle,
					cardImgUrl: input.data.cardImgUrl,
					imgUrlBanner: input.data.imgUrlBanner,
					permissions
				}
			});

			console.log("[specializationRouter.create]: Specialization created by", ctx.user.name, {
				specializationId: specialization.specializationId,
				subjectId: specialization.subjectId,
				slug: specialization.slug,
				title: specialization.title
			});

			return specialization;
		}),
	update: authProcedure
		.input(z.object({ subjectId: z.string(), data: specializationSchema }))
		.mutation(async ({ ctx, input }) => {
			const permissions = await prepareResourceUpdate(
				ctx.user,
				{ specializationId: input.data.specializationId },
				input.data.permissions
			);

			const specialization = await database.specialization.update({
				where: { specializationId: input.data.specializationId },
				data: {
					title: input.data.title,
					slug: input.data.slug,
					subtitle: input.data.subtitle,
					cardImgUrl: input.data.cardImgUrl,
					imgUrlBanner: input.data.imgUrlBanner,
					permissions
				}
			});

			console.log("[specializationRouter.update]: Specialization updated by", ctx.user.name, {
				specializationId: specialization.specializationId,
				subjectId: specialization.subjectId,
				slug: specialization.slug,
				title: specialization.title
			});

			return specialization;
		}),
	addCourse: authProcedure
		.input(
			z.object({ subjectId: z.string(), specializationId: z.string(), courseId: z.string() })
		)
		.mutation(async ({ input: { subjectId, specializationId, courseId }, ctx }) => {
			// Is website ADMIN or ( full(course) ^ ( edit(specialization) v edit(subject) ) )
			if (ctx.user.role !== "ADMIN") {
				const hasCourseAccess = await hasResourceAccess(ctx.user.id, {
					accessLevel: AccessLevel.FULL,
					courseId
				});
				const hasSpAccess = await hasResourceAccess(ctx.user.id, {
					accessLevel: AccessLevel.EDIT,
					specializationId
				});
				const hasSbAccess = await hasResourceAccess(ctx.user.id, {
					accessLevel: AccessLevel.EDIT,
					subjectId
				});
				if (hasCourseAccess && (hasSpAccess || hasSbAccess)) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "Insufficient permissions."
					});
				}
			}

			const added = await database.specialization.update({
				where: { specializationId },
				data: { courses: { connect: { courseId } } },
				select: { specializationId: true }
			});

			console.log(
				"[specializationRouter.addCourse]: Course added to specialization by",
				ctx.user.name,
				{ specializationId, courseId }
			);
			return added;
		}),
	removeCourse: authProcedure
		.input(
			z.object({ subjectId: z.string(), specializationId: z.string(), courseId: z.string() })
		)
		.mutation(async ({ input: { specializationId, courseId }, ctx }) => {
			if (!(await canEdit(ctx.user, { specializationId }))) {
				throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions." });
			}

			const added = await database.specialization.update({
				where: { specializationId },
				data: { courses: { disconnect: { courseId } } },
				select: { specializationId: true }
			});

			console.log(
				"[specializationRouter.removeCourse]: Course removed from specialization by",
				ctx.user.name,
				{ specializationId, courseId }
			);
			return added;
		})
});
