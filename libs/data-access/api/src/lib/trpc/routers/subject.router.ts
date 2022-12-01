import { database } from "@self-learning/database";
import { t } from "../trpc";

export const subjectRouter = t.router({
	getAllWithSpecializations: t.procedure.query(() => {
		return database.subject.findMany({
			orderBy: { title: "asc" },
			select: {
				subjectId: true,
				title: true,
				specializations: {
					orderBy: { title: "asc" },
					select: {
						title: true,
						specializationId: true
					}
				}
			}
		});
	})
});
