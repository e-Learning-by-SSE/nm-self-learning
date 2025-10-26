import { authProcedure, t } from "../trpc";
import { z } from "zod";
import {
	getUserTotalLearningTime,
	getUserDailyLearningTime,
	getUserDailyQuizStats,
	getUserTotalLearningTimeByCourse,
	getUserDailyLearningTimeByCourse,
	getUserLearningStreak,
	getUserCoursesCompletedBySubject,
	getUserHourlyLearningTime,
	getStudentMetric_AverageQuizAnswers,
	getStudentMetric_HourlyAverageQuizAnswers,
	getAuthorMetric_AverageCompletionRate,
	getAuthorMetric_AverageSubjectCompletionRate,
	getAuthorMetric_AverageCourseCompletionRate,
	getAuthorMetric_AverageLessonCompletionRate,
	getAuthorMetric_AverageLessonCompletionRateByCourse
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
	getUserDailyLearningTimeByCourse: metricsQuery(getUserDailyLearningTimeByCourse),
	getUserLearningStreak: metricsQuery(getUserLearningStreak),
	getUserCoursesCompletedBySubject: metricsQuery(getUserCoursesCompletedBySubject),
	getUserHourlyLearningTime: metricsQuery(getUserHourlyLearningTime),
	getStudentMetric_AverageQuizAnswers: metricsQuery(getStudentMetric_AverageQuizAnswers),
	getStudentMetric_HourlyAverageQuizAnswers: metricsQuery(
		getStudentMetric_HourlyAverageQuizAnswers
	),
	getAuthorMetric_AverageCompletionRate: metricsQuery(getAuthorMetric_AverageCompletionRate),
	getAuthorMetric_AverageSubjectCompletionRate: metricsQuery(
		getAuthorMetric_AverageSubjectCompletionRate
	),
	getAuthorMetric_AverageCourseCompletionRate: metricsQuery(
		getAuthorMetric_AverageCourseCompletionRate
	),
	getAuthorMetric_AverageLessonCompletionRate: metricsQuery(
		getAuthorMetric_AverageLessonCompletionRate
	),
	getAuthorMetric_AverageLessonCompletionRateByCourse: metricsQuery(
		getAuthorMetric_AverageLessonCompletionRateByCourse
	)
});
