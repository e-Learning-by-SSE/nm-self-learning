import { database } from "@self-learning/database";
import { authProcedure, t } from "../trpc";
import { ResolvedValue } from "@self-learning/types";
import { z } from "zod";
import { LearningGoalStatus } from "@prisma/client";

export const learningGoalRouter = t.router({
	// returns all learning goals of a user.
	loadLearningGoal: authProcedure.query(async ({ ctx }) => {
		return await getLearningGoals(ctx.user.name);
	}),
	createGoal: authProcedure
		.input(
			z.object({
				description: z.string()
			})
		)
		.mutation(async ({ input, ctx }) => {
			const created = await database.learningGoal.create({
				data: {
					description: input.description,
					username: ctx.user.name
				},
				select: {
					description: true,
					id: true,
					createdAt: true
				}
			});

			console.log("[learningGoalRouter.createGoal]: Goal created by", ctx.user.name, created);
			return created;
		}),
	createSubGoal: authProcedure
		.input(
			z.object({
				description: z.string(),
				learningGoalId: z.string()
			})
		)
		.mutation(async ({ input, ctx }) => {
			const priority = await database.learningSubGoal.aggregate({
				where: { learningGoalId: input.learningGoalId },
				_max: { priority: true }
			});

			const created = await database.learningSubGoal.create({
				data: {
					description: input.description,
					learningGoalId: input.learningGoalId,
					priority: (priority._max.priority ?? 0) + 1
				},
				select: {
					description: true,
					id: true,
					createdAt: true
				}
			});

			console.log(
				"[learningGoalRouter.createSubGoal]: SubGoal created by",
				ctx.user.name,
				created
			);
			return created;
		}),
	editGoal: authProcedure
		.input(
			z.object({
				goalId: z.string(),
				description: z.string()
			})
		)
		.mutation(async ({ input, ctx }) => {
			const updated = await database.learningGoal.update({
				where: { id: input.goalId },
				data: {
					description: input.description
				},
				select: {
					id: true,
					description: true,
					updatedAt: true
				}
			});

			console.log("[learningGoalRouter.editGoal]: Goal updated by", ctx.user.name, updated);
			return updated;
		}),
	editGoalStatus: authProcedure
		.input(
			z.object({
				goalId: z.string(),
				status: z.nativeEnum(LearningGoalStatus)
			})
		)
		.mutation(async ({ input, ctx }) => {
			const updated = await database.learningGoal.update({
				where: { id: input.goalId },
				data: {
					status: input.status
				},
				select: {
					id: true,
					description: true,
					status: true,
					updatedAt: true
				}
			});

			console.log(
				"[learningGoalRouter.editGoalStatus]: Goal updated by",
				ctx.user.name,
				updated
			);
			return updated;
		}),
	editSubGoalStatus: authProcedure
		.input(
			z.object({
				subGoalId: z.string(),
				status: z.nativeEnum(LearningGoalStatus),
				learningGoalId: z.string()
			})
		)
		.mutation(async ({ input, ctx }) => {
			// updates status of a sub-goal
			const updated = await database.learningSubGoal.update({
				where: { id: input.subGoalId },
				data: {
					status: input.status
				},
				select: {
					id: true,
					description: true,
					status: true,
					updatedAt: true
				}
			});
			// updates the "lastProgressUpdate" of the parent and the status if the new status is "Active".
			let updatedGoal;
			if (input.status == LearningGoalStatus.ACTIVE) {
				updatedGoal = await database.learningGoal.update({
					where: { id: input.learningGoalId },
					data: {
						status: input.status
					},
					select: {
						id: true,
						description: true,
						status: true,
						updatedAt: true
					}
				});
			} else {
				updatedGoal = await database.learningGoal.update({
					where: { id: input.learningGoalId },
					data: {},
					select: {
						id: true,
						description: true,
						status: true,
						updatedAt: true
					}
				});
			}

			console.log(
				"[learningGoalRouter.editSubGoalStatus]: SubGoal updated by",
				ctx.user.name,
				"SubGoal: ",
				updated,
				"Goal: ",
				updatedGoal
			);
			return updated;
		}),
	editSubGoal: authProcedure
		.input(
			z.object({
				subGoalId: z.string(),
				description: z.string(),
				learningGoalId: z.string()
			})
		)
		.mutation(async ({ input, ctx }) => {
			// update sub-goal
			const updatedSubGoal = await database.learningSubGoal.update({
				where: { id: input.subGoalId },
				data: {
					description: input.description,
					learningGoalId: input.learningGoalId
				},
				select: {
					id: true,
					description: true,
					updatedAt: true
				}
			});
			// update lastProgressUpdate of parent goal
			const updatedGoal = await database.learningGoal.update({
				where: { id: input.learningGoalId },
				data: {},
				select: {
					id: true,
					description: true,
					updatedAt: true
				}
			});

			console.log(
				"[learningGoalRouter.editSubGoal]: SubGoal updated by",
				ctx.user.name,
				" SubGoal: ",
				updatedSubGoal,
				"Goal: ",
				updatedGoal
			);
			return updatedSubGoal;
		}),
	editSubGoalPriority: authProcedure
		.input(
			z.object({
				subGoalId: z.string(),
				priority: z.number()
			})
		)
		.mutation(async ({ input, ctx }) => {
			const updatedSubGoal = await database.learningSubGoal.update({
				where: { id: input.subGoalId },
				data: {
					priority: input.priority
				},
				select: {
					id: true,
					description: true,
					priority: true
				}
			});

			console.log(
				"[learningGoalRouter.editSubGoalPriority]: SubGoal updated by",
				ctx.user.name,
				" SubGoal: ",
				updatedSubGoal
			);
			return updatedSubGoal;
		}),
	createGoalFromSubGoal: authProcedure
		.input(
			z.object({
				subGoalId: z.string(),
				description: z.string()
			})
		)
		.mutation(async ({ input, ctx }) => {
			// create new learning goal
			const created = await database.learningGoal.create({
				data: {
					description: input.description,
					username: ctx.user.name
				},
				select: {
					description: true,
					id: true,
					createdAt: true
				}
			});
			// delete old sub-goal
			const deleted = await database.learningSubGoal.delete({
				where: { id: input.subGoalId }
			});

			console.log(
				"[learningGoalRouter.createGoalFromSubGoal]: Goal created by",
				ctx.user.name,
				" Goal: ",
				created,
				" deleted SubGoal: ",
				deleted
			);
			return created;
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
	deleteSubGoal: authProcedure
		.input(
			z.object({
				goalId: z.string()
			})
		)
		.mutation(async ({ input }) => {
			return await database.learningSubGoal.delete({
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

export type LearningGoalType = ResolvedValue<typeof getLearningGoals>;

/**
 * Fetch learning goals from database
 * @param username The username of the current user
 * @returns The learning goals of the user
 */
async function getLearningGoals(username: string) {
	return await database.learningGoal.findMany({
		where: { username: username },
		orderBy: {
			updatedAt: { sort: "desc", nulls: "last" }
		},
		select: {
			id: true,
			status: true,
			updatedAt: true,
			description: true,
			learningSubGoals: {
				orderBy: {
					priority: "asc"
				},
				select: {
					id: true,
					description: true,
					priority: true,
					status: true,
					learningGoalId: true
				}
			}
		}
	});
}
