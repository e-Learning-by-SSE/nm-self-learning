import { database } from "../../prisma";

export function getTotalTimeByIdInSeconds(id: string) {
    return database.kpi_total_time_spent.findUnique({
        where: { id }
    });
}
