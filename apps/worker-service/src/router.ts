import { initTRPC } from "@trpc/server";
import { EventEmitter, on } from "events";
import { WorkerHost } from "./lib/core/worker-host";
import { pathGenerationPayloadSchema } from "./lib/schema/path-generation.schema";

export type Context = {
	workerHost: WorkerHost;
};

const t = initTRPC.context<Context>().create();

const ee = new EventEmitter();

/**
 * The tRPC router for the worker service.
 *
 * Use this router to expose jobs to clients (e.g., the Next.js app).
 * Methods should generally:
 * 1. Define an input schema (shared with the job definition).
 * 2. Call `ctx.workerHost.runJob("job-name", input)` to dispatch the work.
 * 3. Return the result.
 *
 * You can also define subscriptions for real-time updates if needed.
 */
export const appRouter = t.router({
	generatePath: t.procedure
		.input(pathGenerationPayloadSchema)
		.mutation(async ({ input, ctx }) => {
			const result = await ctx.workerHost.runJob("path-generation", input);
			ee.emit("path-generated", result.result);
			return result.result;
		}),
	onPathGenerated: t.procedure.subscription(({ signal }) => {
		const iterator = on(ee, "path-generated", { signal });
		const stream = (async function* () {
			yield { path: "demo-path", source: "subscription-demo" };
			for await (const [data] of iterator) {
				yield data;
			}
		})();
		return stream;
	})
});

export type AppRouter = typeof appRouter;
