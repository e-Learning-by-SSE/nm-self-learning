import { database } from "@self-learning/database";
import { authorSchema } from "@self-learning/types";
import { z } from "zod";
import { adminProcedure, authProcedure, t } from "../trpc";
import { updateAuthorAsAdmin } from "@self-learning/admin";
import { editAuthorSchema } from "@self-learning/teaching";

export const authorRouter = t.router({
	getByUsername: authProcedure.input(z.object({ username: z.string() })).query(({ input }) => {
		return database.author.findUniqueOrThrow({
			where: { username: input.username },
			select: {
				username: true,
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
				username: true,
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
		}),
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	updateAsAdmin: adminProcedure
		.input(
			z.object({
				username: z.string(),
				author: authorSchema
			})
		)
		.mutation(async ({ input }) => {
			const updated = await updateAuthorAsAdmin(input);

			console.log("Author updated: ", {
				username: input.username,
				displayName: updated.displayName
			});

			return updated;
		}),
	updateSelf: authProcedure.input(editAuthorSchema).mutation(async ({ ctx, input }) => {
		const updated = await database.author.update({
			where: { username: ctx.user.name },
			data: {
				...input
			},
			select: {
				displayName: true,
				imgUrl: true,
				slug: true
			}
		});

		console.log("[authorRouter.updateSelf]: Author updated", {
			username: ctx.user.name,
			...updated
		});
		return updated;
	})
});
