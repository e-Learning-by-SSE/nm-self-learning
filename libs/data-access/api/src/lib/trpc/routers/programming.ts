import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { t } from "../trpc";

type Runtime = { language: string; version: string };

type Output = {
	stdout: string;
	stderr: string;
	output: string;
	code: number;
	signal: string;
};

type ExecuteResponse = {
	/** Name (not alias) of the runtime used. */
	language: string;
	/** Version of the used runtime. */
	version: string;
	/** Results from the run stage. */
	run: Output;
	/** Results from the compile stage, only provided if the runtime has a compile stage */
	compile?: Output;
};

export const programmingRouter = t.router({
	runtimes: t.procedure.query(async () => {
		const res = await fetch(`${process.env.PISTON_URL}/api/v2/runtimes`);

		if (!res.ok) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: `Request to Piston API failed: ${res.status} - ${res.statusText}`
			});
		}

		const runtimes = (await res.json()) as Runtime[];
		return runtimes;
	}),
	execute: t.procedure
		.input(
			z.object({
				language: z.string(),
				version: z.string(),
				files: z.array(
					z.object({
						name: z.string(),
						content: z.string()
					})
				)
			})
		)
		.mutation(async ({ input }) => {
			const res = await fetch(`${process.env.PISTON_URL}/api/v2/execute`, {
				method: "POST",
				body: JSON.stringify(input),
				headers: {
					"Content-Type": "application/json"
				}
			});

			if (!res.ok) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: `Request to Piston API failed: ${res.status} - ${res.statusText}`
				});
			}

			const executeResponse = (await res.json()) as ExecuteResponse;
			return executeResponse;
		})
});
