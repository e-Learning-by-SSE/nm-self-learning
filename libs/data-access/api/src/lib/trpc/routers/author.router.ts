import { database } from "@self-learning/database";
import { z } from "zod";
import { authProcedure, t } from "../trpc";

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
	})
});
