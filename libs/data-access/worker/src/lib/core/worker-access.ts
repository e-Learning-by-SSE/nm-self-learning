import { workerServiceClient } from "./worker-client"; // Critical: Must not be used in client-side barrel exports
import type { JobKey, ReturnTypeOf } from "../types/job-definitions";
import type { JobEvent } from "../types/events";
import { logJobProgress } from "@self-learning/database";

/**
 * Subscribes the backend to job events for a specific job.
 * Must not be imported by client-side code.
 * @param param0
 */
export async function subscribeToJobEvents<T extends JobKey>({
	jobId,
	jobType,
	onFinish,
	onAbort,
	onError
}: {
	jobId: string;
	jobType: T;
	onFinish?: (result: ReturnTypeOf<T>) => void;
	onAbort?: (cause: string) => void;
	onError?: (errorMsg: string) => void;
}) {
	try {
		const subscription = workerServiceClient.jobQueue.subscribe(
			{ jobId },
			{
				onData: async (event: JobEvent) => {
					await logJobProgress(jobId, event);

					if (event.status === "finished") {
						onFinish?.(event.result as ReturnTypeOf<T>);
						subscription.unsubscribe();
					} else if (event.status === "aborted") {
						onAbort?.(event.cause);
						subscription.unsubscribe();
					}
				},
				onError: async error => {
					const errorMsg = error instanceof Error ? error.message : String(error);
					onError?.(errorMsg);
					await logJobProgress(jobId, {
						type: jobType,
						status: "aborted",
						cause: errorMsg
					});
					subscription.unsubscribe();
				}
			}
		);
	} catch (error) {
		const errorMsg = error instanceof Error ? error.message : String(error);
		onError?.(errorMsg);
		await logJobProgress(jobId, {
			type: jobType,
			status: "aborted",
			cause: "Could not subscribe to job events: " + errorMsg
		});
	}
}
