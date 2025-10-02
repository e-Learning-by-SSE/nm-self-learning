import { database } from "../../prisma";

export function getUserTotalLearningTime(id: string) {
	return database.kpi_total_time_spent.findUnique({
		where: { id }
	});
}

export function getUserDailyLearningTime(id: string) {
	return database.kpi_learning_time_distribution.findMany({
		where: { id },
		orderBy: { day: "asc" }
	});
}
