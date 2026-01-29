import { database } from "@self-learning/database";
import { JobStatus } from "@prisma/client";
import { JobEvent } from "@self-learning/worker-api";

// Mapping of JobEvent types to Prisma JobEvent types
type JobEventType = Exclude<JobEvent["type"], "ready">;

const jobStatusMap: Record<JobEventType, JobStatus> = {
	queued: JobStatus.QUEUED,
	started: JobStatus.STARTED,
	aborted: JobStatus.ABORTED,
	finished: JobStatus.FINISHED
};

const jobRankMap: Record<JobEventType, number> = {
	queued: 0,
	started: 1,
	aborted: 2,
	finished: 2
};

export async function logJobProgress(jobId: string, event: JobEvent) {
	if (event.type !== "ready") {
		let cause = event.type === "aborted" ? event.cause : undefined;
		// !!! Only for testing, will be removed later, do not use for production !!!
		cause = event.type === "finished" && event.result ? JSON.stringify(event.result) : cause;

		return database.$transaction(async tx => {
			const existing = await tx.jobQueue.findUnique({
				where: { id: jobId },
				select: { status: true }
			});

			let shouldUpdate = !existing;
			if (existing) {
				const existingRank = jobRankMap[existing.status as JobEventType];
				shouldUpdate = jobRankMap[event.type] >= existingRank;
			}

			// Only insert/update if new event status is more advanced than existing status
			if (shouldUpdate) {
				return tx.jobQueue.upsert({
					where: { id: jobId },
					create: {
						id: jobId,
						jobType: "HelloWorld",
						status: jobStatusMap[event.type],
						cause
					},
					update: {
						status: jobStatusMap[event.type],
						cause
					}
				});
			} else {
				return undefined;
			}
		});
	} else {
		return undefined;
	}
}
