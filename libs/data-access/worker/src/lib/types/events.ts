import { z } from "zod";

const BaseEventSchema = z.object({
	type: z.string()
});

export const JobEventSchema = z.discriminatedUnion("status", [
	BaseEventSchema.extend({
		status: z.literal("ready")
	}),
	BaseEventSchema.extend({
		status: z.literal("queued")
	}),
	BaseEventSchema.extend({
		status: z.literal("started")
	}),
	BaseEventSchema.extend({
		status: z.literal("aborted"),
		cause: z.string()
	}),
	BaseEventSchema.extend({
		status: z.literal("finished"),
		result: z.unknown().optional()
	})
]);

export type JobEvent = z.infer<typeof JobEventSchema>;

/**
 * Event submitter of the worker-service, must be accessible by the shared router.
 */
export type JobEventBusType = {
	emitJobEvent(jobId: string, evt: JobEvent): void;
	onJobEvent(jobId: string, opts: { signal: AbortSignal | undefined }): AsyncIterable<JobEvent>;
};
