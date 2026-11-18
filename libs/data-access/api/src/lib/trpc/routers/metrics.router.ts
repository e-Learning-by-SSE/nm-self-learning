import { authProcedure, t } from "../trpc";
import { z } from "zod";
import { getCurrentLecturePeriod } from "./university-semester";
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
	getAuthorMetric_AverageCourseCompletionRate,
	getAuthorCourseLessonActivity,
	getSubjects
} from "@self-learning/database/server";

/**
 * Helper to create Metrics query endpoints that accept an optional userId
 */
function metricsQuery<T>(handler: (userId: string) => Promise<T>) {
	return authProcedure.query(async ({ ctx }) => {
		return handler(ctx.user.id);
	});
}

export const MetricsRouter = t.router({
	getCurrentLecturePeriod: authProcedure.query(() => getCurrentLecturePeriod()),
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

	getAuthorMetric_AverageCourseCompletionRate: authProcedure.query(async ({ ctx }) =>
		getAuthorMetric_AverageCourseCompletionRate(ctx.user.id, await getCurrentLecturePeriod())
	),
	getAuthorCourseLessonActivity: authProcedure
		.input(
			z.object({
				courseId: z.string().min(1),
				startDate: z.iso.date(),
				endDate: z.iso.date()
			})
		)
		.query(({ ctx, input }) =>
			getAuthorCourseLessonActivity(
				ctx.user.id,
				input.courseId,
				input.startDate,
				input.endDate
			)
		),
	getSubjects: authProcedure.query(async ({ ctx }) => {
		return getSubjects(ctx.user.name);
	})
});
