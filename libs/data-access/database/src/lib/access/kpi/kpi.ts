import { database } from "../../prisma";

export function getUserTotalLearningTime(id: string) {
	return database.kPITotalLearningTime.findUnique({
		where: { id }
	});
}

export function getUserDailyLearningTime(id: string) {
	return database.kPIDailyLearningTime.findMany({
		where: { id },
		orderBy: { day: "asc" }
	});
}

export function getUserDailyQuizStats(id: string) {
	return database.kPIDailyQuizStats.findMany({
		where: { id },
		orderBy: { day: "asc" }
	});
}

export function getUserTotalLearningTimeByCourse(id: string) {
	return database.kPITotalLearningTimeByCourse.findMany({
		where: { id },
		orderBy: { courseId: "asc" }
	});
}

export function getUserAverageCourseCompletionRateByAuthorByCourse(id: string) {
	return database.kPIAverageCompletionRateByAuthorByCourse.findMany({
		where: { id }
	});
}

export function getUserAverageCourseCompletionRateByAuthor(id: string) {
	return database.kPIAverageCompletionRateByAuthor.findUnique({
		where: { id }
	});
}
