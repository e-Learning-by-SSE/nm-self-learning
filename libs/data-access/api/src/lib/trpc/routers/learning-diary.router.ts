import { database } from "@self-learning/database";
import { z } from "zod";
import { createProtectedRouter } from "../create-router";

export const learningDiaryRouter = createProtectedRouter().mutation("setGoals", {
	input: z.object({
		goals: z.string()
	}),
	resolve({ input, ctx }) {
		return database.learningDiary.update({
			where: { username: ctx.username },
			data: { goals: input.goals },
			select: { goals: true }
		});
	}
});
