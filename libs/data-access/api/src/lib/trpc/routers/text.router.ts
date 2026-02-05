import { t } from "../trpc";
import { z } from "zod";
import { workerServiceClient as worker } from "@self-learning/worker-api";
import { database, logJobProgress } from "@self-learning/database";

// Dummy implementation to demonstrate worker threads and polling for results
export const textRouter = t.router({
	startReverse: t.procedure.input(z.object({ text: z.string() })).mutation(async ({ input }) => {
		const jobId = crypto.randomUUID();

		// Await subscription to be ready before submitting the job
		await new Promise<void>((resolve, reject) => {
			const subscription = worker.jobQueue.subscribe(
				{ jobId },
				{
					onData: async data => {
						if (data?.status === "ready") {
							resolve();
							return;
						} else {
							// Stores final result in jobQueue table, which is not its intension
							// This is only for demonstration without creating an artificial database table
							// !!! Don't do this for productive code !!!
							logJobProgress(jobId, data);
						}
						console.log("Received data for job", jobId, data);

						if (data?.status === "finished" || data?.status === "aborted") {
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
