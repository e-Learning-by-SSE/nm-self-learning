import { database } from "@self-learning/database";
import { subjectSchema } from "@self-learning/types";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { adminProcedure, authProcedure, t } from "../trpc";

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
				cardImgUrl: true,
				subjectAdmin: {
					select: {
						username: true,
						author: {
							select: {
								slug: true,
								displayName: true
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
	getSubjectForEdit: authProcedure
		.input(z.object({ subjectId: z.string() }))
		.query(({ input }) => {
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
											displayName: true
										}
									}
								}
							}
						}
					}
				}
			});
		}),
	createSubject: adminProcedure.input(subjectSchema).mutation(async ({ input }) => {
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

		console.log("[subjectRouter.createSubject]: Subject created", {
			subjectId: subject.subjectId,
			slug: subject.slug,
			title: subject.title
		});

		return subject;
	}),
	updateSubject: authProcedure.input(subjectSchema).mutation(({ input, ctx }) => {
		if (ctx.user.role !== "ADMIN") {
			const subjectAdmin = database.subjectAdmin.findUnique({
				where: {
					subjectId_username: {
						subjectId: input.subjectId,
						username: ctx.user.name
					}
				}
			});

			if (!subjectAdmin) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Requires ADMIN role or subjectAdmin."
				});
			}
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
	})
});
