import { authProcedure, t } from "../trpc";
import { z } from "zod";
import {
	getUserTotalLearningTime,
	getUserDailyLearningTime,
	getUserDailyQuizStats,
	getUserTotalLearningTimeByCourse,
	getUserAverageCompletionRateByAuthorByCourse,
	getUserAverageCompletionRateByAuthor,
	getUserAverageCompletionRateByAuthorBySubject,
	getUserDailyLearningTimeByCourse,
	getUserLearningStreak,
	getUserCoursesCompletedBySubject
} from "@self-learning/database";

/**
 * Helper to create KPI query endpoints that accept an optional userId
 * and default to the authenticated user's ID.
 */
function metricsQuery<T>(handler: (userId: string) => Promise<T>) {
	return authProcedure.input(z.string().optional()).query(async ({ ctx, input }) => {
		const userId = input ?? ctx.user.id;
		return handler(userId);
	});
}

export const MetricsRouter = t.router({
	getUserTotalLearningTime: metricsQuery(getUserTotalLearningTime),
	getUserDailyLearningTime: metricsQuery(getUserDailyLearningTime),
	getUserDailyQuizStats: metricsQuery(getUserDailyQuizStats),
	getUserTotalLearningTimeByCourse: metricsQuery(getUserTotalLearningTimeByCourse),
	getUserAverageCompletionRateByAuthorByCourse: metricsQuery(
		getUserAverageCompletionRateByAuthorByCourse
	),
	getUserAverageCompletionRateByAuthor: metricsQuery(getUserAverageCompletionRateByAuthor),
	getUserAverageCompletionRateByAuthorBySubject: metricsQuery(
		getUserAverageCompletionRateByAuthorBySubject
	),
	getUserDailyLearningTimeByCourse: metricsQuery(getUserDailyLearningTimeByCourse),
	getUserLearningStreak: metricsQuery(getUserLearningStreak),
	getUserCoursesCompletedBySubject: metricsQuery(getUserCoursesCompletedBySubject)
});
