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

/**
 * Fetch average course completion rate by author and by course for a user.
 */
export async function getUserAverageCompletionRateByAuthorByCourse(userId: string) {
	return database.averageCompletionRateByAuthorByCourse.findMany({
		where: { id: userId },
		orderBy: { courseId: "asc" }
	});
}

/**
 * Fetch average course completion rate aggregated by author for a user.
 */
export async function getUserAverageCompletionRateByAuthor(userId: string) {
	return database.averageCompletionRateByAuthor.findUnique({
		where: { id: userId }
	});
}

/**
 * Fetch average completion rate per author and subject for a user.
 */
export async function getUserAverageCompletionRateByAuthorBySubject(userId: string) {
	return database.averageCompletionRateByAuthorBySubject.findMany({
		where: { id: userId },
		orderBy: { subjectTitle: "asc" }
	});
}
