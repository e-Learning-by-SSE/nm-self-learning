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
	getUserLearningStreak
} from "@self-learning/database";

/**
 * Helper to create KPI query endpoints that accept an optional userId
 * and default to the authenticated user's ID.
 */
function kpiQuery<T>(handler: (userId: string) => Promise<T>) {
	return authProcedure.input(z.string().optional()).query(async ({ ctx, input }) => {
		const userId = input ?? ctx.user.id;
		return handler(userId);
	});
}

export const KPIRouter = t.router({
	getUserTotalLearningTime: kpiQuery(getUserTotalLearningTime),
	getUserDailyLearningTime: kpiQuery(getUserDailyLearningTime),
	getUserDailyQuizStats: kpiQuery(getUserDailyQuizStats),
	getUserTotalLearningTimeByCourse: kpiQuery(getUserTotalLearningTimeByCourse),
	getUserAverageCompletionRateByAuthorByCourse: kpiQuery(
		getUserAverageCompletionRateByAuthorByCourse
	),
	getUserAverageCompletionRateByAuthor: kpiQuery(getUserAverageCompletionRateByAuthor),
	getUserAverageCompletionRateByAuthorBySubject: kpiQuery(
		getUserAverageCompletionRateByAuthorBySubject
	),
	getUserDailyLearningTimeByCourse: kpiQuery(getUserDailyLearningTimeByCourse),
	getUserLearningStreak: kpiQuery(getUserLearningStreak)
});
