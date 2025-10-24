import { database } from "../../prisma";

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
