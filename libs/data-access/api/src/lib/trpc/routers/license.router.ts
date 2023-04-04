import { database } from "@self-learning/database";
import { t } from "../trpc";

export const licenseRouter = t.router({
	getAll: t.procedure.query(async () => {
		return await database.license.findMany({
			orderBy: {
				name: "asc"
			}
		});
	})
});
