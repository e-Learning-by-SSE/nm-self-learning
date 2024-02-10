import { Prisma } from "@prisma/client";
import { database } from "@self-learning/database";
import { paginate, Paginated, paginationSchema } from "@self-learning/util/common";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { adminProcedure, t } from "../trpc";

export const adminRouter = t.router({
	findUsers: adminProcedure
		.input(paginationSchema.extend({ name: z.string().optional() }))
		.query(async ({ input }) => {
			const page = input.page;
			const pageSize = 15;

			const where: Prisma.UserWhereInput = {
				name: input.name
					? {
							contains: input.name,
							mode: "insensitive"
					  }
					: undefined
			};

			const [result, totalCount] = await database.$transaction([
				database.user.findMany({
					where,
					select: {
						name: true,
						email: true,
						role: true,
						image: true
					},
					orderBy: {
						name: "asc"
					},
					...paginate(pageSize, page)
				}),
				database.user.count({ where })
			]);

			return { result, totalCount, page, pageSize } satisfies Paginated<unknown>;
		}),
	getUsers: adminProcedure
		.input(
			paginationSchema.extend({
				title: z.string().optional()
			})
		)
		.query(async ({ input }) => {
			const page = input.page;
			const pageSize = 15;

			const where: Prisma.UserWhereInput = {
				name: input.title
					? {
							contains: input.title,
							mode: "insensitive"
					  }
					: undefined
			};

			const [result, totalCount] = await database.$transaction([
				database.user.findMany({
					where,
					select: {
						name: true,
						email: true,
						role: true,
						image: true
					},
					orderBy: {
						name: "asc"
					},
					...paginate(pageSize, page)
				}),
				database.user.count({ where })
			]);

			return { result, totalCount, page, pageSize } satisfies Paginated<unknown>;
		}),
	promoteToAuthor: adminProcedure
		.input(
			z.object({
				username: z.string()
			})
		)
		.mutation(async ({ input }) => {
			const user = await database.user.findUniqueOrThrow({
				where: { name: input.username },
				select: {
					name: true,
					image: true,
					author: true
				}
			});

			if (user.author) {
				throw new TRPCError({
					code: "CONFLICT",
					message: `User "${input.username}" is already an author.`
				});
			}

			const created = await database.author.create({
				data: {
					username: user.name,
					displayName: user.name,
					slug: user.name,
					imgUrl: user.image
				}
			});

			console.log("[adminRouter.promoteToAuthor] Created author:", created);
			return created;
		})
});
