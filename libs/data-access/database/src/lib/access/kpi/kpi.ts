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
