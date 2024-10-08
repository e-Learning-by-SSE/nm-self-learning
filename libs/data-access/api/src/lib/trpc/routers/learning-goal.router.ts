import { database } from "@self-learning/database";
import { authProcedure, t } from "../trpc";
import { z } from "zod";
import { LearningGoalStatus } from "@prisma/client";
import { getLearningGoals } from "@self-learning/diary";

export const learningGoalRouter = t.router({
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
				description: z.string(),
				lastProgressUpdate: z.string().datetime()
			})
		)
		.mutation(async ({ input, ctx }) => {
			const updated = await database.learningGoal.update({
				where: { id: input.goalId },
				data: {
					description: input.description,
					lastProgressUpdate: input.lastProgressUpdate
				},
				select: {
					id: true,
					description: true,
					lastProgressUpdate: true
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
					status: input.status,
					lastProgressUpdate: new Date()
				},
				select: {
					id: true,
					description: true,
					status: true,
					lastProgressUpdate: true
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
			const now = new Date();

			const updatedGoal = await database.$transaction(async prisma => {
				// Update the learning sub-goal
				const updatedSubGoal = await prisma.learningSubGoal.update({
					where: { id: input.subGoalId },
					data: {
						status: input.status,
						lastProgressUpdate: now
					},
					select: {
						id: true,
						description: true,
						status: true,
						lastProgressUpdate: true
					}
				});

				// Update the parent learning goal
				const updatedGoal = await prisma.learningGoal.update({
					where: { id: input.learningGoalId },
					data: {
						lastProgressUpdate: now,
						...(input.status === LearningGoalStatus.ACTIVE && { status: input.status })
					},
					select: {
						id: true,
						description: true,
						status: true,
						lastProgressUpdate: true
					}
				});

				console.log(
					"[learningGoalRouter.editSubGoalStatus]: SubGoal updated by",
					ctx.user.name,
					"SubGoal: ",
					updatedSubGoal,
					"Goal: ",
					updatedGoal
				);

				return { updatedSubGoal, updatedGoal };
			});

			return updatedGoal.updatedSubGoal;
		}),
	editSubGoal: authProcedure
		.input(
			z.object({
				subGoalId: z.string(),
				description: z.string(),
				learningGoalId: z.string(),
				lastProgressUpdate: z.string().datetime()
			})
		)
		.mutation(async ({ input, ctx }) => {
			// update sub-goal
			const updatedSubGoal = await database.learningSubGoal.update({
				where: { id: input.subGoalId },
				data: {
					description: input.description,
					lastProgressUpdate: input.lastProgressUpdate,
					learningGoalId: input.learningGoalId
				},
				select: {
					id: true,
					description: true,
					lastProgressUpdate: true
				}
			});
			// update lastProgressUpdate of parent goal
			const updatedGoal = await database.learningGoal.update({
				where: { id: input.learningGoalId },
				data: {
					lastProgressUpdate: input.lastProgressUpdate
				},
				select: {
					id: true,
					description: true,
					lastProgressUpdate: true
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
