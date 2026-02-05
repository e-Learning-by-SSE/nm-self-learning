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

export async function logJobProgress(jobId: string, event: JobEvent) {
	if (event.status !== "ready") {
		const cause = event.status === "aborted" ? event.cause : undefined;

		// Always upsert without checking existing status
		// Better would be to check if state is newer than before, but this requires transactions,
		// which may in turn block events of being saved
		return database.jobQueue.upsert({
			where: { id: jobId },
			create: {
				id: jobId,
				jobType: event.type,
				status: jobStatusMap[event.status],
				cause
			},
			update: {
				status: jobStatusMap[event.status],
				cause
			}
		});
	} else {
		return undefined;
	}
}
