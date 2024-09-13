import { database, getCoursesAndSubjects } from "@self-learning/database";
import { authorSchema } from "@self-learning/types";
import { z } from "zod";
import { adminProcedure, authorProcedure, authProcedure, t } from "../trpc";
import { updateAuthorAsAdmin } from "@self-learning/admin";
import { editAuthorSchema } from "@self-learning/teaching";
import { paginate, Paginated, paginationSchema } from "@self-learning/util/common";
import { Prisma } from "@prisma/client";
import { courseParticipation } from "@self-learning/analysis";

const participantsInputSchema = z.object({
	resourceIds: z.array(z.string()),
	start: z.date(),
	end: z.date()
});

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
	getCoursesAndSubjects: authorProcedure.query(async ({ ctx }) => {
		return getCoursesAndSubjects(ctx.user.name);
	}),
	courseParticipation: authorProcedure
		.input(participantsInputSchema)
		.query(async ({ ctx, input }) => {
			return courseParticipation({
				courseIds: input.resourceIds,
				start: input.start,
				end: input.end,
				threshold: 10
			});
		}),
	findMany: authProcedure
		.input(
			paginationSchema.extend({
				username: z.string().optional(),
				displayName: z.string().optional()
			})
		)
		.query(async ({ input: { username, page, displayName } }) => {
			const pageSize = 15;
			const { authors, count } = await findAuthor({
				username,
				displayName,
				...paginate(pageSize, page)
			});
			return {
				result: authors,
				totalCount: count,
				page,
				pageSize
			} satisfies Paginated<unknown>;
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

export async function findAuthor({
	username,
	displayName,
	skip,
	take
}: {
	username?: string;
	displayName?: string;
	skip?: number;
	take?: number;
}) {
	const where: Prisma.AuthorWhereInput = {
		username:
			typeof username === "string" && username.length > 0
				? { contains: username, mode: "insensitive" }
				: undefined,
		displayName:
			typeof displayName === "string" && displayName.length > 0
				? { contains: displayName, mode: "insensitive" }
				: undefined
	};

	const [authors, count] = await database.$transaction([
		database.author.findMany({
			select: {
				username: true,
				displayName: true,
				slug: true,
				imgUrl: true
			},
			where,
			take,
			skip
		}),
		database.author.count({ where })
	]);

	return { authors, count };
}
