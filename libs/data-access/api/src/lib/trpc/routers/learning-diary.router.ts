import { Prisma } from "@prisma/client";
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
import { Paginated, paginate, paginationSchema } from "@self-learning/util/common";

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
	hasDiary: authProcedure.mutation(async ({ ctx }) => {
		const learningDiary = await database.learningDiary.findUnique({
			where: {
				username: ctx.user.name
			},
			select: {
				username: true
			}
		});
		let found = false;
		if (learningDiary && learningDiary.username == ctx.user.name) {
			found = true;
		}
		return found;
	}),
	findManyEntries: authProcedure
		.input(paginationSchema.extend({ date: z.string() }))
		.query(async ({ ctx, input: { page, date } }) => {
			const diaryId: string = ctx.user.name;
			const pageSize = 15;
			const { diaryEntries, count } = await findEntries({
				date,
				diaryId,
				...paginate(pageSize, page)
			});
			return {
				result: diaryEntries,
				totalCount: count,
				page,
				pageSize
			} satisfies Paginated<unknown>;
		}),
	findManyCompletedLessons: authProcedure
		.input(paginationSchema.extend({ date: z.string() }))
		.query(async ({ ctx, input: { page, date } }) => {
			const username: string = ctx.user.name;
			const pageSize = 15;
			const { completedLessons, count } = await findCompletedLessons({
				date,
				username,
				...paginate(pageSize, page)
			});
			return {
				result: completedLessons,
				totalCount: count,
				page,
				pageSize
			} satisfies Paginated<unknown>;
		}),
	create: authProcedure.mutation(async ({ ctx }) => {
		const learningDiary = await database.learningDiary.create({
			data: {
				username: ctx.user.name
			}
		});

		console.log("[learningDiaryRouter.create]: Diary created for", ctx.user.name, {
			username: learningDiary.username
		});

		return learningDiary;
	}),
	getEntryForEdit: authProcedure.input(z.object({ entryId: z.string() })).query(({ input }) => {
		return database.diaryEntry.findUnique({
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
					lessonId: input.lessonId,
					learningStrategies: {
						createMany: {
							data: getStrategyData(input.learningStrategies)
						}
					}
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
				duration: z.number().nullable(),
				learningStrategies: z.array(strategySchema).nullable()
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
			await database.learningStrategy.deleteMany({
				where: { diaryEntryID: input.id }
			});
			const diaryEntry = await database.diaryEntry.update({
				where: { id: input.id },
				data: {
					distractions: input.distractions,
					efforts: input.efforts,
					notes: input.notes,
					lessonId: input.lessonId,
					completedLessonId: input.completedLessonId,
					duration: input.duration,
					learningStrategies: {
						createMany: {
							data: getStrategyData(input.learningStrategies)
						}
					}
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
function getStrategyData(
	learningStrategies:
		| { type: "USERSPECIFIC" | "REPEATING"; notes: string | null; confidenceRating: number }[]
		| null
) {
	if (learningStrategies) return learningStrategies;
	else return [];
}

export async function findEntries({
	diaryId,
	date,
	skip,
	take
}: {
	date: string;
	diaryId: string;
	skip?: number;
	take?: number;
}) {
	const where: Prisma.DiaryEntryWhereInput = {
		diaryID: diaryId,
		createdAt: { lte: new Date(date) }
	};
	const [diaryEntries, count] = await database.$transaction([
		database.diaryEntry.findMany({
			select: {
				id: true,
				createdAt: true,
				learningStrategies: true,
				completedLesson: {
					include: {
						course: true,
						lesson: true
					}
				},
				lesson: true
			},
			orderBy: { createdAt: "desc" },
			where,
			take,
			skip
		}),
		database.diaryEntry.count({ where })
	]);

	return { diaryEntries, count };
}

export async function findCompletedLessons({
	username,
	date,
	skip,
	take
}: {
	date: string;
	username: string;
	skip?: number;
	take?: number;
}) {
	const where: Prisma.CompletedLessonWhereInput = {
		username: username,
		createdAt: { lte: new Date(date) }
	};
	const [completedLessons, count] = await database.$transaction([
		database.completedLesson.findMany({
			select: {
				completedLessonId: true,
				createdAt: true,
				lesson: true,
				course: true
			},
			orderBy: { createdAt: "desc" },
			where,
			take,
			skip
		}),
		database.completedLesson.count({ where })
	]);

	return { completedLessons, count };
}
