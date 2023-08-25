import { database } from "@self-learning/database";
import { z } from "zod";
import { authProcedure, t } from "../trpc";
import { GoalType, StrategyType } from "@prisma/client";

export const learningDiaryRouter = t.router({
	getById: authProcedure.input(z.object({ diaryId: z.string() })).query(({ input }) => {
		return database.learningDiary.findUniqueOrThrow({
			where: { username: input.diaryId },
			select: {
				username: true,
				goals: true,
				entries: true,
				learningTimes: true
			}
		});
	}),
	getForEdit: authProcedure
		.input(z.object({ diaryId: z.string() }))
		.query(({ input }) => {
			return database.learningDiary.findUniqueOrThrow({
				where: { username: input.diaryId },
				select: {
					username: true,
					goals: true,
					entries: true,
					learningTimes: true,
					student: true
				}
			});
		}),
	create: authProcedure
		.input(
			z.object({
				diaryId: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const learningDiary = await database.learningDiary.create({
				data: {
					username: input.diaryId
				}
			});

			console.log("[learningDiaryRouter.create]: Diary created for", ctx.user.name, {
				username: learningDiary.username
			});

			return learningDiary;
		}),
	addGoal: authProcedure
		.input(
			z.object({ diaryId: z.string(), goalId: z.string() })
		)
		.mutation(async ({ input: { diaryId, goalId }, ctx }) => {

			const added = await database.learningDiary.update({
				where: { username: diaryId },
				data: {
					goals: {
						connect: { id: goalId }
					}
				},
				select: {
					username: true
				}
			});

			console.log(
				"[learningDiary.addGoal]: Goal added to Diary by",
				ctx.user.name,
				{ diaryId, goalId }
			);
			return added;
		}),
	removeGoal: authProcedure
		.input(
			z.object({ diaryId: z.string(), goalId: z.string() })
		)
		.mutation(async ({ input: { diaryId, goalId }, ctx }) => {
			

			const removed = await database.learningDiary.update({
				where: { username: diaryId },
				data: {
					goals: {
						disconnect: { id:goalId }
					}
				},
				select: {
					username: true
				}
			});

			console.log(
				"[learningDiaryRouter.removeGoal]: Goal removed from Diary by",
				ctx.user.name,
				{ diaryId, goalId }
			);
			return removed;
		}),
		addEntry: authProcedure
		.input(
			z.object({ diaryId: z.string(), entryId: z.string() })
		)
		.mutation(async ({ input: { diaryId, entryId }, ctx }) => {

			const added = await database.learningDiary.update({
				where: { username: diaryId },
				data: {
					entries: {
						connect: { id: entryId }
					}
				},
				select: {
					username: true
				}
			});

			console.log(
				"[learningDiary.addEntry]: Entry added to Diary by",
				ctx.user.name,
				{ diaryId, entryId }
			);
			return added;
		}),
		removeEntry: authProcedure
		.input(
			z.object({ diaryId: z.string(), entryId: z.string() })
		)
		.mutation(async ({ input: { diaryId, entryId }, ctx }) => {
			

			const removed = await database.learningDiary.update({
				where: { username: diaryId },
				data: {
					entries: {
						disconnect: { id:entryId}
					}
				},
				select: {
					username: true
				}
			});

			console.log(
				"[learningDiaryRouter.removeEntry]: Entry removed from Diary by",
				ctx.user.name,
				{ diaryId, entryId }
			);
			return removed;
		}),
		addLearningTime: authProcedure
		.input(
			z.object({ diaryId: z.string(), learningTimeId: z.string() })
		)
		.mutation(async ({ input: { diaryId, learningTimeId }, ctx }) => {

			const added = await database.learningDiary.update({
				where: { username: diaryId },
				data: {
					learningTimes: {
						connect: { id: learningTimeId }
					}
				},
				select: {
					username: true
				}
			});

			console.log(
				"[learningDiary.addLearningTime]: Learning Time added to Diary by",
				ctx.user.name,
				{ diaryId, learningTimeId }
			);
			return added;
		}),
		removeLearningTime: authProcedure
		.input(
			z.object({ diaryId: z.string(), learningTimeId: z.string() })
		)
		.mutation(async ({ input: { diaryId, learningTimeId }, ctx }) => {
			

			const removed = await database.learningDiary.update({
				where: { username: diaryId },
				data: {
					learningTimes: {
						disconnect: { id:learningTimeId}
					}
				},
				select: {
					username: true
				}
			});

			console.log(
				"[learningDiaryRouter.removeEntry]: Learning Time removed from Diary by",
				ctx.user.name,
				{ diaryId, learningTimeId }
			);
			return removed;
		}),
		createGoal: authProcedure
		.input(
			z.object({
				type: z.custom<GoalType>(),
  				description: z.string(),
  				value: z.number(),
  				priority: z.number()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const goal = await database.learningGoal.create({
				data: {
					type: input.type,
					description: input.description,
					value: input.value,
					priority: input.priority,
					diaryID: ctx.user.name
				}
			});

			console.log("[learningDiaryRouter.createGoal]: Goal created for", ctx.user.name, {
				id: goal.id
			});

			return goal;
		}),
		createDiaryEntry: authProcedure
		.input(
			z.object({
				distractions: z.string(),
				efforts: z.string(),
				notes: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const entry = await database.diaryEntry.create({
				data: {
					distractions: input.distractions,
					efforts: input.efforts,
					notes: input.notes,
					diaryID: ctx.user.name
				}
			});

			console.log("[learningDiaryRouter.createEntry]: Entry created by", ctx.user.name, {
				id: entry.id
			});

			return entry;
		}),
		addStrategytoEntry: authProcedure
		.input(
			z.object({ entryId: z.string(), strategyId: z.string() })
		)
		.mutation(async ({ input: { entryId, strategyId }, ctx }) => {

			const added = await database.diaryEntry.update({
				where: { id: entryId },
				data: {
					learningStrategies: {
						connect: { id: strategyId }
					}
				},
				select: {
					id: true
				}
			});

			console.log(
				"[learningDiary.addStrategietoEntry]: Strategy added to Entry by",
				ctx.user.name,
				{ entryId, strategyId }
			);
			return added;
		}),
		removeStrategyfromEntry: authProcedure
		.input(
			z.object({ entryId: z.string(), strategyId: z.string() })
		)
		.mutation(async ({ input: { entryId, strategyId }, ctx }) => {
			

			const removed = await database.diaryEntry.update({
				where: { id: entryId },
				data: {
					learningStrategies: {
						disconnect: { id:strategyId}
					}
				},
				select: {
					id: true
				}
			});

			console.log(
				"[learningDiaryRouter.removeStrategyfromEntry]: Strategy removed from Entry by",
				ctx.user.name,
				{ entryId, strategyId }
			);
			return removed;
		}),
		createLearningStrategy: authProcedure
		.input(
			z.object({
				type: z.custom<StrategyType>(),
				duration: z.number(),
				confidenceRating: z.number().max(5),
				notes: z.string(),
				diaryEntryID: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const strategy = await database.learningStrategy.create({
				data: {
					type: input.type,
					duration: input.duration,
					confidenceRating: input.confidenceRating,
					notes: input.notes,
					diaryEntryID: input.diaryEntryID
				}
			});

			console.log("[learningDiaryRouter.createEntry]: Strategy created by", ctx.user.name, {
				id: strategy.id
			});

			return strategy;
		}),
		createLearningTime: authProcedure
		.input(
			z.object({
				startingDate: z.date(),
				endDate: z.date(),
				frequency: z.number(),
				location: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const learningTime = await database.learningTime.create({
				data: {
					startingDate: input.startingDate,
					endDate: input.endDate,
					frequency: input.frequency,
					diaryID: ctx.user.name
				}
			});

			console.log("[learningDiaryRouter.createLearningTime]: Learning Time created by", ctx.user.name, {
				id: learningTime.id
			});

			return learningTime;
		})
});

