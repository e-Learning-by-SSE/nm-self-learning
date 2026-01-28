import { initTRPC } from "@trpc/server";
import { SubmitJobInput } from "../types/job-definitions";
import { Context } from "../types/core";
import z from "zod";

const t = initTRPC.context<Context>().create();

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
	submitJob: t.procedure.input(SubmitJobInput).mutation(async ({ input, ctx }) => {
		// Notify job queued
		ctx.events.emitJobEvent(input.jobId, { type: "queued" });

		// Run the job async
		void ctx.workerHost
			.runJob(input.jobId, input.jobType, input.payload)
			.then(result =>
				ctx.events.emitJobEvent(input.jobId, { type: "finished", result: result.result })
			)
			.catch(err =>
				ctx.events.emitJobEvent(input.jobId, { type: "aborted", cause: String(err) })
			);
	}),
	jobQueue: t.procedure
		.input(z.object({ jobId: z.string() }))
		.subscription(({ input, signal, ctx }) => {
			// Forwards the event stream from the EventEmitter to subscribers
			return ctx.events.onJobEvent(input.jobId, { signal });
		})
});

export type WorkerAppRouterType = typeof appRouter;
