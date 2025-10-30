import { authProcedure, t } from "../trpc";
import { z } from "zod";
import {
	getStudentMetric_LearningTime,
	getStudentMetric_DailyLearningTime,
	getStudentMetric_HourlyLearningTime,
	getStudentMetric_LearningTimeByCourse,
	getStudentMetric_DailyLearningTimeByCourse,
	getStudentMetric_CoursesCompletedBySubject,
	getStudentMetric_LearningStreak,
	getStudentMetric_AverageQuizAnswers,
	getStudentMetric_HourlyAverageQuizAnswers,
	getAuthorMetric_AverageCompletionRate,
	getAuthorMetric_AverageSubjectCompletionRate,
	getAuthorMetric_AverageCourseCompletionRate,
	getAuthorMetric_AverageLessonCompletionRate,
	getAuthorMetric_AverageLessonCompletionRateByCourse,
	getSubjects
} from "@self-learning/database";

/**
 * Helper to create Metrics query endpoints that accept an optional userId
 */
function metricsQuery<T>(handler: (userId: string) => Promise<T>) {
	return authProcedure.input(z.string().optional()).query(async ({ ctx, input }) => {
		const userId = input ?? ctx.user.id;
		return handler(userId);
	});
}

export const MetricsRouter = t.router({
	getStudentMetric_LearningTime: metricsQuery(getStudentMetric_LearningTime),
	getStudentMetric_DailyLearningTime: metricsQuery(getStudentMetric_DailyLearningTime),
	getStudentMetric_HourlyLearningTime: metricsQuery(getStudentMetric_HourlyLearningTime),
	getStudentMetric_LearningTimeByCourse: metricsQuery(getStudentMetric_LearningTimeByCourse),
	getStudentMetric_DailyLearningTimeByCourse: metricsQuery(
		getStudentMetric_DailyLearningTimeByCourse
	),
	getStudentMetric_CoursesCompletedBySubject: metricsQuery(
		getStudentMetric_CoursesCompletedBySubject
	),
	getStudentMetric_LearningStreak: metricsQuery(getStudentMetric_LearningStreak),
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
	),
	getSubjects: authProcedure.query(async () => {
		return getSubjects();
	})
});
