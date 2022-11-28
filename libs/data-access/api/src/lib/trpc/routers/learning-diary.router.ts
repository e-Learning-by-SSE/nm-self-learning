import { database } from "@self-learning/database";
import { z } from "zod";
import { authProcedure, t } from "../trpc";

export const learningDiaryRouter = t.router({
	setGoals: authProcedure
		.input(
			z.object({
				goals: z.string()
			})
		)
				.mutation(async ({ ctx, input }) => {
			return database.learningDiary.update({
				where: { username: ctx.username },
				data: { goals: input.goals },
				select: { goals: true }
			});
		})
});
