import { database } from "@self-learning/database";
import { subjectSchema } from "@self-learning/types";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { adminProcedure, authProcedure, t } from "../trpc";
import { UserFromSession } from "../context";
import { hasAccessLevel, PermissionResourceEnum } from "./permission.router";

export const subjectRouter = t.router({
	getAllWithSpecializations: t.procedure.query(() => {
		return database.subject.findMany({
			orderBy: { title: "asc" },
			select: {
				subjectId: true,
				title: true,
				specializations: {
					orderBy: { title: "asc" },
					select: {
						title: true,
						cardImgUrl: true,
						specializationId: true
					}
				}
			}
		});
	}),
	getAllForAdminPage: t.procedure.query(() => {
		return database.subject.findMany({
			orderBy: { title: "asc" },
			select: {
				subjectId: true,
				title: true,
				subtitle: true,
				cardImgUrl: true,
				permissions: {
					select: {
						accessLevel: true,
						user: {
							select: {
								author: {
									select: {
										slug: true,
										displayName: true,
										imgUrl: true
									}
								}
							}
						}
					}
				},
				_count: {
					select: {
						courses: true,
						specializations: true
					}
				}
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
				specializations: {
					orderBy: { title: "asc" },
					include: {
						specializationAdmin: {
							orderBy: { author: { displayName: "asc" } },
							select: {
								author: {
									select: {
										username: true,
										slug: true,
										displayName: true,
										imgUrl: true
									}
								}
							}
						}
					}
				}
			}
		});
	}),
	create: adminProcedure.input(subjectSchema).mutation(async ({ input }) => {
		const subject = await database.subject.create({
			data: {
				subjectId: input.slug,
				title: input.title,
				slug: input.slug,
				subtitle: input.subtitle,
				cardImgUrl: input.cardImgUrl,
				imgUrlBanner: input.imgUrlBanner
			}
		});

		console.log("[subjectRouter.create]: Subject created", {
			subjectId: subject.subjectId,
			slug: subject.slug,
			title: subject.title
		});

		return subject;
	}),
	update: authProcedure.input(subjectSchema).mutation(async ({ input, ctx }) => {
		if (!(await canEdit(ctx.user, input.subjectId))) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Insufficient permissions."
			});
		}

		return database.subject.update({
			where: { subjectId: input.subjectId },
			data: {
				title: input.title,
				slug: input.slug,
				subtitle: input.subtitle,
				cardImgUrl: input.cardImgUrl,
				imgUrlBanner: input.imgUrlBanner
			}
		});
	}),
	setSpecializationPermissions: authProcedure
		.input(
			z.object({
				subjectId: z.string(),
				/** `{ [specializationId]: { [username]: boolean } }` */
				specMap: z.record(z.record(z.boolean()))
			})
		)
		.mutation(async ({ input, ctx }) => {
			if (!(await canEdit(ctx.user, input.subjectId))) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Insufficient permissions."
				});
			}

			const specIds = Object.keys(input.specMap);

			const assigned: { username: string; specializationId: string }[] = specIds.flatMap(
				specializationId =>
					Object.entries(input.specMap[specializationId])
						.filter(([_username, isChecked]) => isChecked)
						.map(([username]) => ({ username, specializationId }))
			);

			await database.$transaction([
				database.specializationAdmin.deleteMany({
					where: {
						OR: specIds.map(specializationId => ({ specializationId }))
					}
				}),
				database.specializationAdmin.createMany({
					data: assigned
				})
			]);
		})
});

async function canEdit(user: UserFromSession, subjectId: string): Promise<boolean> {
	if (user.role === "ADMIN") return true;
	return await hasAccessLevel(user.id, PermissionResourceEnum.Enum.SUBJECT, subjectId, "EDIT");
}
