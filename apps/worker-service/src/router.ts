import { initTRPC } from "@trpc/server";
import { EventEmitter, on } from "events";
import { JobRegistry } from "./lib/core/job-registry";
import { WorkerHost } from "./lib/core/worker-host";
import { pathGenerationPayloadSchema } from "./lib/schema/path-generation.schema";

export type Context = {
	registry: JobRegistry;
	workerHost: WorkerHost;
};

const t = initTRPC.context<Context>().create();

const ee = new EventEmitter();

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
