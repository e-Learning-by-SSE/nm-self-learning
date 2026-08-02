import { database } from "@self-learning/database";
import { resourcePermissionSelect, specializationSchema } from "@self-learning/types";
import { z } from "zod";
import { authProcedure, t } from "../trpc";
import {
	canDelete,
	canEdit,
	hasResourceAccess,
	preparePermissionsForCreate,
	prepareResourceUpdate
} from "../../permissions/permission.service";
import { TRPCError } from "@trpc/server";
import { AccessLevel } from "@prisma/client";
import { UserFromSession } from "../context";

const attachmentSchema = z.object({
	subjectId: z.string(),
	specializationId: z.string(),
	courseId: z.string()
});

type AttachmentType = z.infer<typeof attachmentSchema>;

async function canAttachCourse(user: UserFromSession, input: AttachmentType) {
	// Is website ADMIN or ( full(course) ^ ( edit(specialization) v edit(subject) ) )
	if (user.role === "ADMIN") {
		return true;
	}
	const { courseId, specializationId, subjectId } = input;
	const hasCourseAccess = await hasResourceAccess(user.id, {
		accessLevel: AccessLevel.FULL,
		courseId
	});
	const hasSpAccess = await hasResourceAccess(user.id, {
		accessLevel: AccessLevel.EDIT,
		specializationId
	});
	const hasSbAccess = await hasResourceAccess(user.id, {
		accessLevel: AccessLevel.EDIT,
		subjectId
	});
	return hasCourseAccess && (hasSpAccess || hasSbAccess);
}

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
						select: resourcePermissionSelect
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
	deleteSpecialization: authProcedure
		.input(z.object({ specializationId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const resource = { specializationId: input.specializationId };

			if (!(await canDelete(ctx.user, resource))) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Insufficient permissions."
				});
			}

			return database.specialization.delete({
				where: resource,
				select: {
					specializationId: true,
					title: true,
					slug: true
				}
			});
		}),
	addCourse: authProcedure.input(attachmentSchema).mutation(async ({ input, ctx }) => {
		if (!(await canAttachCourse(ctx.user, input))) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Insufficient permissions."
			});
		}

		const { specializationId, courseId } = input;

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
	removeCourse: authProcedure.input(attachmentSchema).mutation(async ({ input, ctx }) => {
		if (!(await canAttachCourse(ctx.user, input))) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Insufficient permissions."
			});
		}
		const { specializationId, courseId } = input;

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
