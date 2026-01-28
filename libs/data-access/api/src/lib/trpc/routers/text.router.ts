import { t } from "../trpc";
import { z } from "zod";
import { workerServiceClient as worker } from "@self-learning/worker-api";
import { database } from "@self-learning/database";
import { JobStatus } from "@prisma/client";

// Dummy implementation to demonstrate worker threads and polling for results
const jobStatusMap: Record<string, JobStatus> = {
	queued: JobStatus.QUEUED,
	started: JobStatus.STARTED,
	aborted: JobStatus.ABORTED,
	finished: JobStatus.FINISHED
};

export const textRouter = t.router({
	startReverse: t.procedure.input(z.object({ text: z.string() })).mutation(async ({ input }) => {
		const jobId = crypto.randomUUID();

		// Await subscription to be ready before submitting the job
		await new Promise<void>((resolve, reject) => {
			const subscription = worker.jobQueue.subscribe(
				{ jobId },
				{
					onData: async data => {
						if (data?.type === "ready") {
							resolve();
							return;
						} else {
							// Missing to avoid overwriting later status if in wrong order
							// Stores final result in jobQueue table, which is not its intension
							// This is only for demonstration without creating an artificial database table
							// !!! Don't do this for productive code !!!
							let cause = data.type === "aborted" ? data.cause : "";
							if (data.type === "finished") {
								cause = JSON.stringify(data.result);
							}
							await database.jobQueue.upsert({
								where: { id: jobId },
								create: {
									id: jobId,
									jobType: "HelloWorld",
									status: jobStatusMap[data.type],
									cause
								},
								update: { status: jobStatusMap[data.type], cause }
							});
						}
						console.log("Received data for job", jobId, data);

						if (data?.type === "finished" || data?.type === "aborted") {
							subscription.unsubscribe();
						}
					},
					onError: err => {
						console.error("Error for job", jobId, err);
						subscription.unsubscribe();
						reject();
					}
				}
			);
		});

		worker.submitJob.mutate({
			jobId,
			jobType: "HelloWorld",
			payload: { msg: input.text }
		});
		return { jobId };
	}),

	getResult: t.procedure.input(z.object({ jobId: z.string() })).query(async ({ input }) => {
		// !!! Use table only to check if result is ready, not for storing results !!!
		const job = await database.jobQueue.findUnique({
			where: { id: input.jobId, status: "FINISHED" },
			select: { cause: true }
		});
		const result = job?.cause ? JSON.parse(job.cause) : null;
		return result;
	})
});
