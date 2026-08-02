import { database } from "@self-learning/database";
import { resourcePermissionSelect, subjectSchema } from "@self-learning/types";
import { z } from "zod";
import { adminProcedure, authProcedure, t } from "../trpc";
import {
	canDelete,
	hasResourceAccess,
	preparePermissionsForCreate,
	prepareResourceUpdate
} from "../../permissions/permission.service";
import { TRPCError } from "@trpc/server";
import { UserFromSession } from "../context";
import { AccessLevel } from "@prisma/client";

const attachmentSchema = z.object({
	subjectId: z.string(),
	courseId: z.string()
});
type AttachmentType = z.infer<typeof attachmentSchema>;

async function canAttachCourse(user: UserFromSession, input: AttachmentType) {
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
	// TODO should it go into subject router and why?
	removeCourse: authProcedure.input(attachmentSchema).mutation(async ({ input, ctx }) => {
		if (!(await canAttachCourse(ctx.user, input))) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Insufficient permissions."
			});
		}

		const added = database.course.update({
			where: { courseId: input.courseId },
			data: { subjectId: null },
			select: {
				courseId: true,
				subjectId: true,
				title: true,
				slug: true
			}
		});

		console.log("[subjectRouter.removeCourse]: Course removed from subject by", ctx.user.name, {
			subjectId: input.subjectId,
			courseId: input.courseId
		});
		return added;
	})
});
