import { database } from "@self-learning/database";
import { t } from "../trpc";

export const licenseRouter = t.router({
	getAll: t.procedure.query(async () => {
		return await database.license.findMany({
			orderBy: {
				name: "asc"
			}
		});
	}),

	getDefault: t.procedure.query(async () => {
		// Default: Find first license with defaultSuggestion = true
		let data = await database.license.findFirst({
			where: {
				defaultSuggestion: true
			},
			orderBy: {
				name: "asc"
			}
		});

		// Fallback: Find first license
		if (!data) {
			data = await database.license.findFirst({
				orderBy: {
					name: "asc"
				}
			});
		}

		return data;
	})
});
