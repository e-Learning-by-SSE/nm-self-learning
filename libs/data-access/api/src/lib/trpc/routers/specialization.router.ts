import { database } from "@self-learning/database";
import { specializationSchema } from "@self-learning/types";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { authProcedure, t, UserFromSession } from "../trpc";

export const specializationRouter = t.router({
	getById: authProcedure.input(z.object({ specializationId: z.string() })).query(({ input }) => {
		return database.specialization.findUniqueOrThrow({
			where: { specializationId: input.specializationId },
			select: {
				specializationId: true,
				slug: true,
				cardImgUrl: true,
				title: true,
				subject: {
					select: {
						subjectId: true,
						slug: true,
						title: true
					}
				}
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
		.input(
			z.object({
				subjectId: z.string(),
				data: specializationSchema
			})
		)
		.mutation(async ({ ctx, input }) => {
			const canCreate = await canCreateSpecializationInSubject(input.subjectId, ctx.user);

			if (!canCreate) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: `Requires ADMIN role or subjectAdmin in ${input.subjectId}.`
				});
			}

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

			console.log("[specializationRouter.create]: Specialization created", {
				specializationId: specialization.specializationId,
				subjectId: specialization.subjectId,
				slug: specialization.slug,
				title: specialization.title
			});

			return specialization;
		}),
	update: authProcedure
		.input(
			z.object({
				subjectId: z.string(),
				data: specializationSchema
			})
		)
		.mutation(async ({ ctx, input }) => {
			const canEdit = await canEditSpecializationInSubject(
				input.subjectId,
				input.data.specializationId,
				ctx.user
			);

			if (!canEdit) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: `Requires ADMIN role or subjectAdmin in ${input.subjectId} or specializationAdmin in ${input.data.specializationId}.`
				});
			}

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

			console.log("[specializationRouter.update]: Specialization updated", {
				specializationId: specialization.specializationId,
				subjectId: specialization.subjectId,
				slug: specialization.slug,
				title: specialization.title
			});

			return specialization;
		})
});

async function canCreateSpecializationInSubject(
	subjectId: string,
	user: UserFromSession
): Promise<boolean> {
	if (user.role === "ADMIN") {
		return true;
	}

	const subjectAdmin = await database.subjectAdmin.findUnique({
		where: {
			subjectId_username: { subjectId, username: user.name }
		}
	});

	if (subjectAdmin) {
		return true;
	}

	return false;
}

async function canEditSpecializationInSubject(
	subjectId: string,
	specializationId: string,
	user: UserFromSession
): Promise<boolean> {
	const canCreate = await canCreateSpecializationInSubject(subjectId, user);

	if (canCreate) {
		return true;
	}

	const specializationAdmin = await database.specializationAdmin.findUnique({
		where: {
			specializationId_username: { specializationId, username: user.name }
		}
	});

	if (specializationAdmin) {
		return true;
	}

	return false;
}
