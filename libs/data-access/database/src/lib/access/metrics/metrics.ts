import { database } from "../../prisma";

/**
 * Fetch total learning time KPI for a user.
 */
export async function getUserTotalLearningTime(userId: string) {
	return database.totalLearningTime.findUnique({
		where: { id: userId }
	});
}

/**
 * Fetch daily learning time data for a user, ordered by day ascending.
 */
export async function getUserDailyLearningTime(userId: string) {
	return database.dailyLearningTime.findMany({
		where: { id: userId },
		orderBy: { day: "asc" }
	});
}

/**
 * Fetch hourly learning time data for a user, ordered by hour ascending.
 */
export async function getUserHourlyLearningTime(userId: string) {
	return database.hourlyLearningTime.findMany({
		where: { id: userId },
		orderBy: { hour: "asc" }
	});
}

/**
 * Fetch daily quiz statistics for a user, ordered by day ascending.
 */
export async function getUserDailyQuizStats(userId: string) {
	return database.dailyQuizStats.findMany({
		where: { id: userId },
		orderBy: { day: "asc" }
	});
}

/**
 * Fetch total learning time per course for a user.
 */
export async function getUserTotalLearningTimeByCourse(userId: string) {
	return database.totalLearningTimeByCourse.findMany({
		where: { id: userId },
		orderBy: { courseId: "asc" }
	});
}

/**
 * Fetch daily learning time per course for a user, ordered by day ascending.
 */
export async function getUserDailyLearningTimeByCourse(userId: string) {
	return database.dailyLearningTimeByCourse.findMany({
		where: { id: userId },
		orderBy: { day: "asc" }
	});
}

/**
 * Fetch current learning streak for a user.
 */
export async function getUserLearningStreak(userId: string) {
	return database.learningStreak.findUnique({
		where: { id: userId }
	});
}

/**
 * Fetch number of courses completed per subject for a user.
 */
export async function getUserCoursesCompletedBySubject(userId: string) {
	return database.coursesCompletedBySubject.findMany({
		where: { id: userId }
	});
}

/**
 * Fetch average quiz answers metrics for a student.
 */
export async function getStudentMetric_AverageQuizAnswers(userId: string) {
	return database.studentMetric_AverageQuizAnswers.findMany({
		where: { userId: userId }
	});
}

/**
 * Fetch hourly average quiz answers metrics for a student.
 */
export async function getStudentMetric_HourlyAverageQuizAnswers(userId: string) {
	return database.studentMetric_HourlyAverageQuizAnswers.findMany({
		where: { userId: userId }
	});
}
