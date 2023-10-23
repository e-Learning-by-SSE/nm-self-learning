import { database } from "@self-learning/database";
import { z } from "zod";
import { authProcedure, t } from "../trpc";
import { GoalType, StrategyType } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import {
	CourseContent,
	StrategyOverview,
	extractLessonIds,
	strategySchema
} from "@self-learning/types";

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
	getForEdit: authProcedure.input(z.object({ diaryId: z.string() })).query(({ input }) => {
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
		.input(z.object({ diaryId: z.string(), goalId: z.string() }))
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

			console.log("[learningDiary.addGoal]: Goal added to Diary by", ctx.user.name, {
				diaryId,
				goalId
			});
			return added;
		}),
	removeGoal: authProcedure
		.input(z.object({ diaryId: z.string(), goalId: z.string() }))
		.mutation(async ({ input: { diaryId, goalId }, ctx }) => {
			const removed = await database.learningDiary.update({
				where: { username: diaryId },
				data: {
					goals: {
						disconnect: { id: goalId }
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
		.input(z.object({ diaryId: z.string(), entryId: z.string() }))
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

			console.log("[learningDiary.addEntry]: Entry added to Diary by", ctx.user.name, {
				diaryId,
				entryId
			});
			return added;
		}),
	removeEntry: authProcedure
		.input(z.object({ diaryId: z.string(), entryId: z.string() }))
		.mutation(async ({ input: { diaryId, entryId }, ctx }) => {
			const removed = await database.learningDiary.update({
				where: { username: diaryId },
				data: {
					entries: {
						disconnect: { id: entryId }
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
	getEntryForEdit: authProcedure.input(z.object({ entryId: z.string() })).query(({ input }) => {
		return database.diaryEntry.findUniqueOrThrow({
			where: { id: input.entryId },
			select: {
				id: true,
				distractions: true,
				completedLesson: true,
				efforts: true,
				notes: true,
				createdAt: true,
				learningStrategies: true,
				lesson: true,
				lessonId: true,
				completedLessonId: true,
				duration: true
			}
		});
	}),
	getStrategyOverview: authProcedure.query(async ({ ctx }) => {
		return getStrategyOverviewForUser(ctx.user.name);
	}),

	addLearningTime: authProcedure
		.input(z.object({ diaryId: z.string(), learningTimeId: z.string() }))
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
		.input(z.object({ diaryId: z.string(), learningTimeId: z.string() }))
		.mutation(async ({ input: { diaryId, learningTimeId }, ctx }) => {
			const removed = await database.learningDiary.update({
				where: { username: diaryId },
				data: {
					learningTimes: {
						disconnect: { id: learningTimeId }
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
				type: z.nativeEnum(GoalType),
				description: z.string(),
				targetValue: z.number(),
				priority: z.number()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const goal = await database.learningGoal.create({
				data: {
					type: input.type,
					description: input.description,
					targetValue: input.targetValue,
					priority: input.priority,
					diaryID: ctx.user.name
				}
			});

			console.log("[learningDiaryRouter.createGoal]: Goal created for", ctx.user.name, {
				id: goal.id
			});

			return goal;
		}),

	incrementActualValueForGoal: authProcedure
		.input(
			z.object({
				actualValue: z.number(),
				id: z.string()
			})
		)
		.mutation(async ({ input: { id, actualValue }, ctx }) => {
			const goal = await database.learningGoal.update({
				where: { id: id },
				data: {
					actualValue: actualValue
				},
				select: {
					id: true
				}
			});

			console.log(
				"[learningDiaryRouter.incrementActualValueForGoal]: Actual value was incremented for Goal by",
				ctx.user.name,
				{ id, actualValue }
			);

			return goal;
		}),

	markGoalAsAchieved: authProcedure
		.input(
			z.object({
				id: z.string()
			})
		)
		.mutation(async ({ input: { id }, ctx }) => {
			const goal = await database.learningGoal.update({
				where: { id: id },
				data: {
					achieved: true
				},
				select: {
					id: true
				}
			});

			console.log(
				"[learningDiaryRouter.markGoalAsAchieved]: Goal was marked as achieved by",
				ctx.user.name,
				{ id }
			);

			return goal;
		}),

	deleteGoal: authProcedure
		.input(
			z.object({
				id: z.string()
			})
		)
		.mutation(async ({ input: { id }, ctx }) => {
			const goal = await database.learningGoal.delete({
				where: { id: id }
			});

			console.log("[learningDiaryRouter.delete]: Goal was deleted by", ctx.user.name, { id });

			return goal;
		}),

	createDiaryEntry: authProcedure
		.input(
			z.object({
				distractions: z.string().nullable(),
				efforts: z.string().nullable(),
				notes: z.string().nullable(),
				lessonId: z.string().nullable(),
				completedLessonId: z.number().nullable(),
				duration: z.number().nullable(),
				learningStrategies: z.array(strategySchema).nullable()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const entry = await database.diaryEntry.create({
				data: {
					distractions: input.distractions,
					efforts: input.efforts,
					notes: input.notes,
					diaryID: ctx.user.name,
					duration: input.duration,
					completedLessonId: input.completedLessonId,
					lessonId: input.lessonId
				}
			});

			console.log("[learningDiaryRouter.createEntry]: Entry created by", ctx.user.name, {
				id: entry.id
			});

			return entry;
		}),
	updateDiaryEntry: authProcedure
		.input(
			z.object({
				id: z.string(),
				distractions: z.string().nullable(),
				efforts: z.string().nullable(),
				notes: z.string().nullable(),
				lessonId: z.string().nullable(),
				completedLessonId: z.number().nullable(),
				duration: z.number().nullable()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const entry = await database.diaryEntry.findUniqueOrThrow({
				where: { id: input.id },
				select: {
					diaryID: true
				}
			});
			if (entry.diaryID != ctx.user.name) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: `Not allowed to change Entry for diaries that not belong to ${ctx.user.name}.`
				});
			}

			const diaryEntry = await database.diaryEntry.update({
				where: { id: input.id },
				data: {
					distractions: input.distractions,
					efforts: input.efforts,
					notes: input.notes,
					lessonId: input.lessonId,
					completedLessonId: input.completedLessonId,
					duration: input.duration
				}
			});

			console.log("[LearningDiaryRouter.updateDiaryEntry]: Entry updated by", ctx.user.name, {
				distractions: diaryEntry.distractions,
				efforts: diaryEntry.efforts,
				notes: diaryEntry.notes,
				lessonId: diaryEntry.lessonId,
				completedLessonId: diaryEntry.completedLessonId,
				duration: diaryEntry.duration
			});

			return diaryEntry;
		}),

	addStrategyToEntry: authProcedure
		.input(z.object({ entryId: z.string(), strategyId: z.string() }))
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
				"[learningDiary.addStrategieToEntry]: Strategy added to Entry by",
				ctx.user.name,
				{ entryId, strategyId }
			);
			return added;
		}),
	removeStrategyFromEntry: authProcedure
		.input(z.object({ entryId: z.string(), strategyId: z.string() }))
		.mutation(async ({ input: { entryId, strategyId }, ctx }) => {
			const removed = await database.diaryEntry.update({
				where: { id: entryId },
				data: {
					learningStrategies: {
						disconnect: { id: strategyId }
					}
				},
				select: {
					id: true
				}
			});

			console.log(
				"[learningDiaryRouter.removeStrategyFromEntry]: Strategy removed from Entry by",
				ctx.user.name,
				{ entryId, strategyId }
			);
			return removed;
		}),
	createLearningStrategy: authProcedure
		.input(
			z.object({
				type: z.custom<StrategyType>(),
				confidenceRating: z.number().min(0).max(10),
				notes: z.string().nullable(),
				diaryEntryID: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const strategy = await database.learningStrategy.create({
				data: {
					type: input.type,
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

			console.log(
				"[learningDiaryRouter.createLearningTime]: Learning Time created by",
				ctx.user.name,
				{
					id: learningTime.id
				}
			);

			return learningTime;
		}),
	getLessons: t.procedure
		.input(z.object({ slugs: z.string().array() }))
		.query(async ({ input }) => {
			const courses = await database.course.findMany({
				where: { slug: { in: input.slugs } },
				select: {
					content: true
				}
			});
			const contents: CourseContent[] = [];
			courses.forEach(ele => {
				const content = (ele.content ?? []) as CourseContent;
				contents.push(content);
			});
			const lessonIds: string[] = [];
			if (contents ?? false)
				contents.forEach(element => {
					lessonIds.push(...extractLessonIds(element));
				});

			const lessons = await database.lesson.findMany({
				where: { lessonId: { in: lessonIds } },
				select: {
					lessonId: true,
					title: true
				}
			});
			return lessons;
		})
});

export async function getStrategyOverviewForUser(user: string): Promise<StrategyOverview[]> {
	const idsFound = await database.diaryEntry.findMany({
		where: { diaryID: user },
		select: {
			id: true
		}
	});
	const ids: string[] = [];
	idsFound.forEach(ele => ids.push(ele.id));
	return getStrategyOverviewForEntryIDs(ids);
}
export async function getStrategyOverviewForEntryIDs(
	diaryEntryIDs: string[]
): Promise<StrategyOverview[]> {
	const strategies = await database.learningStrategy.groupBy({
		by: ["type"],
		_avg: {
			confidenceRating: true
		},
		_count: {
			type: true
		},
		where: { diaryEntryID: { in: diaryEntryIDs } }
	});
	return strategies;
}
