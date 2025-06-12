import { database } from "@self-learning/database";
import { getLearningGoals } from "@self-learning/diary";
import { learningGoalCreateSchema, learningGoalSchema } from "@self-learning/types";
import { z } from "zod";
import { authProcedure, t } from "../trpc";

export const learningGoalRouter = t.router({
	loadLearningGoal: authProcedure.query(async ({ ctx }) => {
		return await getLearningGoals(ctx.user.name);
	}),
	createGoal: authProcedure.input(learningGoalCreateSchema).mutation(async ({ input, ctx }) => {
		const created = await database.learningGoal.create({
			data: {
				...input,
				username: ctx.user.name,
				children: input.children
					? { connect: input.children.map(childId => ({ id: childId })) }
					: undefined
			},
			select: {
				description: true,
				id: true,
				createdAt: true
			}
		});

		return created;
	}),
	editGoal: authProcedure.input(learningGoalSchema.partial()).mutation(async ({ input, ctx }) => {
		const { id, children, ...rest } = input;
		const data: Record<string, unknown> = { ...rest };
		if (children) {
			data.children = { set: children.map(childId => ({ id: childId })) };
		}
		return database.learningGoal.update({
			where: { id, username: ctx.user.name },
			data,
			select: {
				id: true,
				description: true,
				lastProgressUpdate: true
			}
		});
	}),

	deleteGoal: authProcedure
		.input(
			z.object({
				goalId: z.string()
			})
		)
		.mutation(async ({ input }) => {
			return await database.learningGoal.delete({
				where: { id: input.goalId }
			});
		}),
	getAll: authProcedure.query(async ({ ctx }) => {
		return database.learningGoal.findMany({
			where: { username: ctx.user.name },
			select: {
				description: true,
				id: true,
				status: true
			}
		});
	})
});
