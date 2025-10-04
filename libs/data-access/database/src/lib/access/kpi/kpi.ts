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
