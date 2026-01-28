import { z } from "zod";

export const JobEventSchema = z.discriminatedUnion("type", [
	z.object({
		type: z.literal("ready")
	}),
	z.object({
		type: z.literal("queued")
	}),
	z.object({
		type: z.literal("started")
	}),
	z.object({
		type: z.literal("aborted"),
		cause: z.string()
	}),
	z.object({
		type: z.literal("finished"),
		result: z.unknown()
	})
]);

export type JobEvent = z.infer<typeof JobEventSchema>;

/**
 * Event submitter of the worker-service, must be accessible by the shared router.
 */
export type JobEventBusType = {
	emitJobEvent(jobId: string, evt: JobEvent): void;
	onJobEvent(jobId: string, opts: { signal: AbortSignal }): AsyncIterable<JobEvent>;
};
