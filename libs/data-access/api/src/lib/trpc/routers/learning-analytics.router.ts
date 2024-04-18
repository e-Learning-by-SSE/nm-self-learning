import { database } from "@self-learning/database";
import { z } from "zod";
import { authProcedure, t } from "../trpc";
import { ResolvedValue } from "@self-learning/types";

export const learningAnalyticsRouter = t.router({
	createSession: authProcedure.mutation(async ({ ctx }) => {
		return database.lASession.create({
			data: {
				username: ctx.user.name
			},
			select: { id: true }
		});
	}),
	setEndOfSession: authProcedure
		.input(
			z.object({
				id: z.number(),
				end: z.string().datetime()
			})
		)
		.mutation(async ({ input }) => {
			const entry = await database.lASession.update({
				where: { id: input.id },
				data: { end: input.end },
				select: { id: true, end: true }
			});
			console.log("[learningAnalyticsRouter.updateSession]: id ", entry.id, entry.end);
			return entry;
		}),
	deleteSessions: authProcedure.mutation(async ({ ctx }) => {
		return await database.lASession.deleteMany({
			where: { username: ctx.user.name }
		});
	}),
	createLearningAnalytics: authProcedure
		.input(
			z.object({
				lessonId: z.string(),
				courseId: z.string(),
				sessionId: z.number(),
				start: z.string().datetime().nullable(),
				end: z.string().datetime().nullable(),
				quizStart: z.string().datetime().nullable(),
				quizEnd: z.string().datetime().nullable(),
				numberCorrectAnswers: z.number().nullable(),
				numberIncorrectAnswers: z.number().nullable(),
				numberOfUsedHints: z.number().nullable(),
				numberOfChangesMediaType: z.number().nullable(),
				preferredMediaType: z.string().nullable(),
				videoBreaks: z.number().nullable(),
				videoStart: z.string().datetime().nullable(),
				videoEnd: z.string().datetime().nullable(),
				videoSpeed: z.number().nullable()
				//videoCalculatedSpeed: z.number()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const entry = await database.learningAnalytics.create({
				data: {
					sessionId: input.sessionId,
					lessonId: input.lessonId,
					courseId: input.courseId,
					start: input.start,
					end: input.end,
					quizStart: input.quizStart,
					quizEnd: input.quizEnd,
					numberCorrectAnswers: input.numberCorrectAnswers,
					numberIncorrectAnswers: input.numberIncorrectAnswers,
					numberOfUsedHints: input.numberOfUsedHints,
					numberOfChangesMediaType: input.numberOfChangesMediaType,
					preferredMediaType: input.preferredMediaType,
					videoBreaks: input.videoBreaks,
					videoSpeed: input.videoSpeed,
					//videoCalculatedSpeed: input.videoCalculatedSpeed,
					videoStart: input.videoStart,
					videoEnd: input.videoEnd
				},
				select: { id: true }
			});

			console.log(
				"[learningAnalyticsRouter.createLearningAnalytics]: Entry created by",
				ctx.user.name,
				{
					id: entry.id
				}
			);

			return entry;
		}),
	loadLearningAnalytics: authProcedure.query(async ({ ctx }) => {
		return await getLASession(ctx.user.name);
	}),
	updateLearningAnalytics: authProcedure
		.input(
			z.object({
				id: z.number(),
				end: z.string().datetime(),
				quizStart: z.string().datetime(),
				quizEnd: z.string().datetime(),
				numberCorrectAnswers: z.number(),
				numberIncorrectAnswers: z.number(),
				numberOfUsedHints: z.number(),
				numberOfChangesMediaType: z.number(),
				preferredMediaType: z.string(),
				videoBreaks: z.number(),
				videoStart: z.string().datetime(),
				videoEnd: z.string().datetime(),
				videoSpeed: z.number(),
				videoCalculatedSpeed: z.number()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const lAEntry = await database.learningAnalytics.update({
				where: { id: input.id },
				data: {
					end: input.end,
					quizStart: input.quizStart,
					quizEnd: input.quizEnd,
					numberCorrectAnswers: input.numberCorrectAnswers,
					numberIncorrectAnswers: input.numberIncorrectAnswers,
					numberOfUsedHints: input.numberOfUsedHints,
					numberOfChangesMediaType: input.numberOfChangesMediaType,
					preferredMediaType: input.preferredMediaType,
					videoBreaks: input.videoBreaks,
					videoSpeed: input.videoSpeed,
					videoCalculatedSpeed: input.videoCalculatedSpeed,
					videoStart: input.videoStart,
					videoEnd: input.videoEnd
				}
			});

			console.log(
				"[LearningAnalyticsRouter.updateLearningAnalytics]: Entry updated by",
				ctx.user.name,
				{
					lAEntry
				}
			);

			return lAEntry;
		})
});

export type LearningAnalyticsType = ResolvedValue<typeof getLASession>;

/**
 * Fetch learning analytic data from database
 * @param username The username of the current user
 * @returns The learning analytic data of the user
 */
async function getLASession(username: string) {
	/*
	 * Very critical: Minimize included data.
	 * By omitting data from course and lesson we can reduce the size of a query
	 * on the sample data from 1.05MB to 0.09MB.
	 */
	return await database.lASession.findMany({
		where: { username: username },
		orderBy: {
			start: "asc"
		},
		select: {
			start: true,
			end: true,
			learningAnalytics: {
				select: {
					sessionId: true,
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
					start: true,
					end: true,
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
