import { database } from "@self-learning/database";
import { t, adminProcedure} from "../trpc";
import * as z from "zod";
import { licenseSchema } from "@self-learning/types";

export const licenseRouter = t.router({
	getAll: t.procedure.query(async () => {
		return await database.license.findMany({
			orderBy: {
				name: "asc"
			}
		});
	}),
	getOne: t.procedure.input(z.object({ licenseId: z.number() })).query(({ input }) => {
		return database.license.findUniqueOrThrow({
			where: { licenseId: input.licenseId }
		});
	}),
	updateAsAdmin: adminProcedure
		.input(
			z.object({
				licenseId: z.number(),
				license: licenseSchema
			})
		)
		.mutation(async ({ input }) => {
			const updated = await database.license.update({
				where: { licenseId: input.licenseId },
				data: {
					name: input.license.name,
					url: input.license.licenseUrl,
					licenseText: input.license.licenseText,
					logoUrl: input.license.imgUrl,
					oerCompatible: input.license.oerCompatible,
					selectable: input.license.selectable
				}
			});

			console.log("License updated: ", {
				licenseId: input.licenseId,
				license: input.license
			});

			return updated;
		}),
	createAsAdmin: adminProcedure
		.input(
			z.object({
				license: licenseSchema
			})
		)
		.mutation(async ({ input }) => {
			const created = await database.license.create({
				data: {
					name: input.license.name,
					url: input.license.licenseUrl,
					licenseText: input.license.licenseText,
					logoUrl: input.license.imgUrl,
					oerCompatible: input.license.oerCompatible,
					selectable: input.license.selectable
				}
			});
			console.log("License created: ", {
				license: input.license
			});
			return created;
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
