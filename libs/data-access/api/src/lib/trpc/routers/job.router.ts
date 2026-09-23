import { z } from "zod";
import { authProcedure, t } from "../trpc";
import { database } from "@self-learning/database";

export const jobEventRouter = t.router({
	getStatus: authProcedure
		.input(
			z.object({
				jobId: z.string()
			})
		)
		.output(
			z.object({
				status: z.string().nullable(),
				cause: z.string().nullable()
			})
		)
		.query(async ({ input }) => {
			const status = await database.jobQueue.findUnique({
				where: {
					id: input.jobId
				}
			});
			return {
				status: status?.status ?? null,
				cause: status?.cause ?? null
			};
		})
});
