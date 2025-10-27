import { database } from "../../prisma";

/**
 * Fetch total learning time for a student.
 */
export async function getStudentMetric_LearningTime(userId: string) {
	return database.studentMetric_LearningTime.findUnique({
		where: { userId: userId }
	});
}

/**
 * Fetch daily learning time for a student
 */
export async function getStudentMetric_DailyLearningTime(userId: string) {
	return database.studentMetric_DailyLearningTime.findMany({
		where: { userId: userId }
	});
}

/**
 * Fetch hourly learning time for a student
 */
export async function getStudentMetric_HourlyLearningTime(userId: string) {
	return database.studentMetric_HourlyLearningTime.findMany({
		where: { userId: userId }
	});
}

/**
 * Fetch learning time by course for a student
 */
export async function getStudentMetric_LearningTimeByCourse(userId: string) {
	return database.studentMetric_LearningTimeByCourse.findMany({
		where: { userId: userId }
	});
}

/**
 * Fetch daily learning time by course for a student
 */
export async function getStudentMetric_DailyLearningTimeByCourse(userId: string) {
	return database.studentMetric_DailyLearningTimeByCourse.findMany({
		where: { userId: userId }
	});
}

/**
 * Fetch courses completed by subject for a student
 */
export async function getStudentMetric_CoursesCompletedBySubject(userId: string) {
	return database.studentMetric_CoursesCompletedBySubject.findMany({
		where: { userId: userId }
	});
}

/**
 * Fetch learning streak for a student
 */
export async function getStudentMetric_LearningStreak(userId: string) {
	return database.studentMetric_LearningStreak.findUnique({
		where: { userId: userId }
	});
}

/**
 * Fetch average quiz answers for a student
 */
export async function getStudentMetric_AverageQuizAnswers(userId: string) {
	return database.studentMetric_AverageQuizAnswers.findMany({
		where: { userId: userId }
	});
}

/**
 * Fetch hourly average quiz answers for a student
 */
export async function getStudentMetric_HourlyAverageQuizAnswers(userId: string) {
	return database.studentMetric_HourlyAverageQuizAnswers.findMany({
		where: { userId: userId }
	});
}
