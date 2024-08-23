import { database } from "@self-learning/database";
import { ResolvedValue, analyticsSchema, makeAllFieldsNullish } from "@self-learning/types";
import { z } from "zod";
import { authProcedure, t } from "../trpc";

export const learningSequenceRouter = t.router({
	create: authProcedure
		.input(
			z.object({
				start: z.date(),
				end: z.date().optional()
			})
		)
		.mutation(async ({ ctx, input }) => {
			return await database.learningSequence.create({
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
				// the id has to be check. It comes from client side and is not checked to be owned by the user
				id: z.string(),
				end: z.date()
			})
		)
		.mutation(async ({ input }) => {
			const entry = await database.learningSequence.update({
				where: { id: input.id },
				data: { end: input.end },
				select: { id: true, end: true }
			});
			console.log("[learningAnalyticsRouter.updateSession]: id ", entry.id, entry.end);
			return entry;
		}),
	delete: authProcedure.mutation(async ({ ctx }) => {
		return await database.learningSequence.deleteMany({
			where: { username: ctx.user.name }
		});
	})
});

export const learningActivityRouter = t.router({
	create: authProcedure
		.input(
			makeAllFieldsNullish(analyticsSchema).extend({
				sequenceId: z.string().uuid().optional(),
				lessonId: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			return database.$transaction(async _ => {
				if (!input.sequenceId) {
					const learningSequence = await database.learningSequence.create({
						data: {
							username: ctx.user.name,
							start: input.lessonStart ?? new Date()
						},
						select: { id: true, start: true, end: true }
					});
					input.sequenceId = learningSequence.id;
				}
				const entry = await database.learningActivity.create({
					data: {
						...input,
						sequenceId: input.sequenceId
					},
					select: { id: true, lessonId: true, sequenceId: true }
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
			const lAEntry = await database.learningSequence.update({
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
	const data = await database.learningSequence.findMany({
		where: { username: username },
		orderBy: {
			start: "asc"
		},
		select: {
			start: true,
			end: true,
			activities: {
				select: {
					sequenceId: true,
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
					preferredMediaType: true,
					mediaChangeCountVideo: true,
					mediaChangeCountArticle: true,
					mediaChangeCountIframe: true,
					mediaChangeCountPdf: true,
					videoStart: true,
					videoEnd: true,
					videoBreaks: true,
					videoSpeed: true
				}
			}
		}
	});
	return data.map(entry => ({
		...entry,
		activities: entry.activities.map(activity => ({
			...activity,
			mediaChangeCount: {
				video: activity.mediaChangeCountVideo,
				article: activity.mediaChangeCountArticle,
				iframe: activity.mediaChangeCountIframe,
				pdf: activity.mediaChangeCountPdf
			}
		})),
		learningAnalytics: entry.activities
	}));
}
