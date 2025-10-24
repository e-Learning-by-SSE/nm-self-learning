import { database } from "../../prisma";

/**
 * Fetch average completion rate by author for a user.
 */
export async function getAuthorMetric_AverageCompletionRate(userId: string) {
	return database.authorMetric_AverageCompletionRate.findUnique({
		where: { authorId: userId }
	});
}

/**
 * Fetch average subject completion rate by author for a user.
 */
export async function getAuthorMetric_AverageSubjectCompletionRate(userId: string) {
	return database.authorMetric_AverageSubjectCompletionRate.findMany({
		where: { authorId: userId }
	});
}

/**
 * Fetch average course completion rate by author for a user.
 */
export async function getAuthorMetric_AverageCourseCompletionRate(userId: string) {
	return database.authorMetric_AverageCourseCompletionRate.findMany({
		where: { authorId: userId }
	});
}

/**
 * Fetch average lesson completion rate by author for a user.
 */
export async function getAuthorMetric_AverageLessonCompletionRate(userId: string) {
	return database.authorMetric_AverageLessonCompletionRate.findMany({
		where: { authorId: userId }
	});
}

/**
 * Fetch daily average lesson completion rate by author for a user.
 */
export async function getAuthorMetric_DailyAverageLessonCompletionRate(userId: string) {
	return database.authorMetric_DailyAverageLessonCompletionRate.findMany({
		where: { authorId: userId }
	});
}

/**
 * Fetch average lesson completion rate by author and by course for a user.
 */
export async function getAuthorMetric_AverageLessonCompletionRateByCourse(userId: string) {
	return database.authorMetric_AverageLessonCompletionRateByCourse.findMany({
		where: { authorId: userId }
	});
}

/**
 * Fetch daily average lesson completion rate by author and by course for a user.
 */
export async function getAuthorMetric_DailyAverageLessonCompletionRateByCourse(userId: string) {
	return database.authorMetric_DailyAverageLessonCompletionRateByCourse.findMany({
		where: { authorId: userId }
	});
}
