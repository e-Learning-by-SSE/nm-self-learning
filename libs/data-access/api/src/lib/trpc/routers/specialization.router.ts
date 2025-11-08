import { database } from "@self-learning/database";
import { specializationSchema } from "@self-learning/types";
import { z } from "zod";
import { authProcedure, t } from "../trpc";

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
					imgUrlBanner: true
				}
			});
		}),
	create: authProcedure
		.input(z.object({ subjectId: z.string(), data: specializationSchema }))
		.mutation(async ({ ctx, input }) => {
			// All can create and edit for now
			// if (!canEdit) {
			// 	throw new TRPCError({
			// 		code: "FORBIDDEN",
			// 		message: `Requires ADMIN role or EDIT in ${input.subjectId}.`
			// 	});
			// }

			const specialization = await database.specialization.create({
				data: {
					subjectId: input.subjectId,
					specializationId: input.data.slug,
					title: input.data.title,
					slug: input.data.slug,
					subtitle: input.data.subtitle,
					cardImgUrl: input.data.cardImgUrl,
					imgUrlBanner: input.data.imgUrlBanner
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
			// All can create and edit for now
			// if (!canEdit) {
			// 	throw new TRPCError({
			// 		code: "FORBIDDEN",
			// 		message: `Requires ADMIN role or EDIT in ${input.subjectId}.`
			// 	});
			// }

			const specialization = await database.specialization.update({
				where: { specializationId: input.data.specializationId },
				data: {
					title: input.data.title,
					slug: input.data.slug,
					subtitle: input.data.subtitle,
					cardImgUrl: input.data.cardImgUrl,
					imgUrlBanner: input.data.imgUrlBanner
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
		.mutation(async ({ input: { specializationId, courseId }, ctx }) => {
			// All can create and edit for now
			// if (!(await canCreateOrEdit(ctx.user, subjectId))) {
			// 	throw new TRPCError({
			// 		code: "FORBIDDEN",
			// 		message: `Requires ADMIN role or EDIT in ${subjectId}.`
			// 	});
			// }

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
			// All can create and edit for now
			// if (!(await canCreateOrEdit(ctx.user, subjectId))) {
			// 	throw new TRPCError({
			// 		code: "FORBIDDEN",
			// 		message: `Requires ADMIN role or EDIT in ${subjectId}.`
			// 	});
			// }

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
