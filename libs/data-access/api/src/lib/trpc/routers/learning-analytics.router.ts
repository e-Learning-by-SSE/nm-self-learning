import { database } from "@self-learning/database";
import { z } from "zod";
import { authProcedure, t } from "../trpc";
import { ResolvedValue, analyticsSchema, makeAllFieldsNullish } from "@self-learning/types";

export const learningPeriodRouter = t.router({
	create: authProcedure
		.input(
			z.object({
				start: z.date(),
				end: z.date().optional()
			})
		)
		.mutation(async ({ ctx, input }) => {
			return await database.learningPeriod.create({
				data: {
					username: ctx.user.name,
					start: input.start,
					end: input.end
				},
				select: { id: true, start: true, end: true }
			});
		}),
	update: authProcedure
		.input(
			z.object({
				id: z.string(),
				end: z.date()
			})
		)
		.mutation(async ({ input }) => {
			const entry = await database.learningPeriod.update({
				where: { id: input.id },
				data: { end: input.end },
				select: { id: true, end: true }
			});
			console.log("[learningAnalyticsRouter.updateSession]: id ", entry.id, entry.end);
			return entry;
		}),
	delete: authProcedure.mutation(async ({ ctx }) => {
		return await database.learningPeriod.deleteMany({
			where: { username: ctx.user.name }
		});
	})
});

export const learningActivityRouter = t.router({
	create: authProcedure
		.input(
			makeAllFieldsNullish(analyticsSchema).extend({
				lessonId: z.string().uuid(),
				periodId: z.string().uuid().optional(),
				lessonStart: z.date()
			})
		)
		.mutation(async ({ ctx, input }) => {
			return database.$transaction(async _ => {
				if (!input.periodId) {
					const learningPeriod = await database.learningPeriod.create({
						data: {
							username: ctx.user.name,
							start: input.lessonStart ?? new Date()
						},
						select: { id: true, start: true, end: true }
					});
					input.periodId = learningPeriod.id;
				}
				const entry = await database.learningActivity.create({
					data: { ...input, periodId: input.periodId },
					select: { id: true, lessonId: true, periodId: true }
				});
				console.debug(
					"[learningAnalyticsRouter.createLearningAnalytics]: Entry created by",
					ctx.user.name,
					{
						id: entry.id
					}
				);
				return entry;
			});
		}),
	findUserSpecific: authProcedure.query(async ({ ctx }) => {
		return await getLearningActivities(ctx.user.name);
	}),
	update: authProcedure
		.input(makeAllFieldsNullish(analyticsSchema).extend({ id: z.string().uuid() }))
		.mutation(async ({ ctx, input }) => {
			const lAEntry = await database.learningActivity.update({
				where: { id: input.id },
				data: { ...input }
			});

			console.debug(
				"[LearningAnalyticsRouter.updateLearningAnalytics]: Entry updated by",
				ctx.user.name,
				{ lAEntry }
			);
			return lAEntry;
		})
});

export type LearningAnalyticsType = ResolvedValue<typeof getLearningActivities>;

/**
 * Fetch learning analytic data from database
 * @param username The username of the current user
 * @returns The learning analytic data of the user
 */
async function getLearningActivities(username: string) {
	/*
	 * Very critical: Minimize included data.
	 * By omitting data from course and lesson we can reduce the size of a query
	 * on the sample data from 1.05MB to 0.09MB.
	 */
	return await database.learningPeriod.findMany({
		where: { username: username },
		orderBy: {
			start: "asc"
		},
		select: {
			start: true,
			end: true,
			activities: {
				select: {
					periodId: true,
					lessonId: true,
					lesson: {
						select: {
							title: true,
							slug: true
						}
					},
					courseId: true,
					course: {
						select: {
							title: true,
							slug: true
						}
					},
					lessonStart: true,
					lessonEnd: true,
					quizStart: true,
					quizEnd: true,
					numberCorrectAnswers: true,
					numberIncorrectAnswers: true,
					numberOfUsedHints: true,
					numberOfChangesMediaType: true,
					preferredMediaType: true,
					videoStart: true,
					videoEnd: true,
					videoBreaks: true,
					videoSpeed: true
				}
			}
		}
	});
}
