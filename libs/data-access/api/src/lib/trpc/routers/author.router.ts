import { database } from "@self-learning/database";
import { z } from "zod";
import { adminProcedure, authProcedure, t } from "../trpc";

export const authorRouter = t.router({
	getBySlug: authProcedure.input(z.object({ slug: z.string() })).query(({ input }) => {
		return database.author.findUniqueOrThrow({
			where: { slug: input.slug },
			select: {
				slug: true,
				displayName: true,
				imgUrl: true
			}
		});
	}),
	getAll: authProcedure.query(() => {
		return database.author.findMany({
			select: {
				slug: true,
				displayName: true,
				imgUrl: true
			}
		});
	}),
	getAllWithSubject: adminProcedure.query(() => {
		return database.user.findMany({
			where: { NOT: { author: null } },
			orderBy: { author: { displayName: "asc" } },
			select: {
				name: true,
				role: true,
				author: {
					select: {
						slug: true,
						displayName: true,
						imgUrl: true,
						subjectAdmin: {
							select: {
								subject: {
									select: {
										title: true
									}
								}
							}
						}
					}
				}
			}
		});
	}),
	getAuthorForForm: adminProcedure
		.input(
			z.object({
				username: z.string()
			})
		)
		.query(({ input }) => {
			return database.user.findUniqueOrThrow({
				where: { name: input.username },
				select: {
					name: true,
					role: true,
					author: {
						select: {
							slug: true,
							displayName: true,
							imgUrl: true,
							username: true,
							subjectAdmin: {
								select: {
									subject: {
										select: {
											title: true,
											subjectId: true
										}
									}
								}
							},
							specializationAdmin: {
								select: {
									specialization: {
										select: {
											specializationId: true,
											title: true
										}
									}
								}
							}
						}
					}
				}
			});
		})
});
