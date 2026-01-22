import { initTRPC } from "@trpc/server";
import { EventEmitter, on } from "events";
import { WorkerHost } from "./lib/core/worker-host";
import { pathGenerationPayloadSchema } from "./lib/schema/path-generation.schema";
import { helloWorldSchema } from "./jobs/hello-world.job";
import { randomUUID } from "crypto";
import z from "zod";
// import superjson from "superjson";

export type Context = {
	workerHost: WorkerHost;
};

const t = initTRPC.context<Context>().create({
	// transformer: superjson
});

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
			// Generates a unique job ID for event subscription
			const jobId = randomUUID();

			// const result = await ctx.workerHost.runJob("path-generation", input);
			// ee.emit("path-generated", result.result);
			// return result.result;
			void ctx.workerHost
				.runJob("path-generation", { jobId, ...input })
				.then(result => ee.emit("path-generated", { jobId, data: result.result }))
				.catch(err => ee.emit("path-generated", { jobId, error: String(err) }));
			return { jobId };
		}),
	// onPathGenerated: t.procedure.subscription(({ signal }) => {
	// const iterator = on(ee, "path-generated", { signal });
	// const stream = (async function* () {
	// 	yield { path: "demo-path", source: "subscription-demo" };
	// 	for await (const [data] of iterator) {
	// 		yield data;
	// 	}
	// })();
	// return stream;
	onPathGenerated: t.procedure
		.input(z.object({ jobId: z.string() }))
		.subscription(({ input, signal }) => {
			const iterator = on(ee, "path-generated", { signal });

			const stream = (async function* () {
				for await (const [evt] of iterator) {
					if (evt.jobId === input.jobId) {
						yield evt.data; // { jobId, data } oder { jobId, error }
					}
				}
			})();

			return stream;
		}),
	reverse: t.procedure.input(helloWorldSchema).mutation(async ({ input, ctx }) => {
		const jobId = randomUUID();

		// Job async starten
		void ctx.workerHost
			.runJob("hello-world", { jobId, ...input })
			.then(result => {
				ee.emit("message-reversed", {
					jobId,
					data: result.result
				});
			})
			.catch(err => {
				ee.emit("message-reversed", {
					jobId,
					error: String(err)
				});
			});

		// sofort zurück
		return { jobId };
	}),
	onReversed: t.procedure
		.input(z.object({ jobId: z.string() }))
		.subscription(({ input, signal }) => {
			const iterator = on(ee, "message-reversed", { signal });

			const stream = (async function* () {
				for await (const [evt] of iterator) {
					if (evt.jobId === input.jobId) {
						if (evt.error) throw new Error(evt.error);
						yield evt.data; // { jobId, data } oder { jobId, error }
					}
				}
			})();
			return stream;
		})
});

export type AppRouter = typeof appRouter;
