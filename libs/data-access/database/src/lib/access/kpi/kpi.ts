import { database } from "../../prisma";

/**
 * Fetch total learning time KPI for a user.
 */
export async function getUserTotalLearningTime(userId: string) {
	return database.kPITotalLearningTime.findUnique({
		where: { id: userId }
	});
}

/**
 * Fetch daily learning time data for a user, ordered by day ascending.
 */
export async function getUserDailyLearningTime(userId: string) {
	return database.kPIDailyLearningTime.findMany({
		where: { id: userId },
		orderBy: { day: "asc" }
	});
}

/**
 * Fetch daily quiz statistics for a user, ordered by day ascending.
 */
export async function getUserDailyQuizStats(userId: string) {
	return database.kPIDailyQuizStats.findMany({
		where: { id: userId },
		orderBy: { day: "asc" }
	});
}

/**
 * Fetch total learning time per course for a user.
 */
export async function getUserTotalLearningTimeByCourse(userId: string) {
	return database.kPITotalLearningTimeByCourse.findMany({
		where: { id: userId },
		orderBy: { courseId: "asc" }
	});
}

/**
 * Fetch average course completion rate by author and by course for a user.
 */
export async function getUserAverageCompletionRateByAuthorByCourse(userId: string) {
	return database.kPIAverageCompletionRateByAuthorByCourse.findMany({
		where: { id: userId },
		orderBy: { courseId: "asc" }
	});
}

/**
 * Fetch average course completion rate aggregated by author for a user.
 */
export async function getUserAverageCompletionRateByAuthor(userId: string) {
	return database.kPIAverageCompletionRateByAuthor.findUnique({
		where: { id: userId }
	});
}

/**
 * Fetch average completion rate per author and subject for a user.
 */
export async function getUserAverageCompletionRateByAuthorBySubject(userId: string) {
	return database.kPIAverageCompletionRateByAuthorBySubject.findMany({
		where: { id: userId },
		orderBy: { subjectTitle: "asc" }
	});
}

/**
 * Fetch daily learning time per course for a user, ordered by day ascending.
 */
export async function getUserDailyLearningTimeByCourse(userId: string) {
	return database.kPIDailyLearningTimeByCourse.findMany({
		where: { id: userId },
		orderBy: { day: "asc" }
	});
}

/**
 * Fetch current learning streak for a user.
 */
export async function getUserLearningStreak(userId: string) {
	return database.kPILearningStreak.findUnique({
		where: { id: userId }
	});
}
