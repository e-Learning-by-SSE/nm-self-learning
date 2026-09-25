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
	attachResultToStatus,
	onFinish,
	onAbort,
	onError
}: {
	jobId: string;
	jobType: T;
	attachResultToStatus?: boolean;
	onFinish?: (result: ReturnTypeOf<T>) => Promise<void>;
	onAbort?: (cause: string) => Promise<void>;
	onError?: (errorMsg: string) => Promise<void>;
}) {
	try {
		const subscription = workerServiceClient.jobQueue.subscribe(
			{ jobId },
			{
				onData: async (event: JobEvent) => {
					if (event.status === "finished") {
						await onFinish?.(event.result as ReturnTypeOf<T>);
						subscription.unsubscribe();
						const serializedResult = attachResultToStatus
							? JSON.stringify(event.result)
							: undefined;
						console.log("Serialized result:", serializedResult);
						await logJobProgress(jobId, event, serializedResult);
					} else if (event.status === "aborted") {
						await onAbort?.(event.cause);
						subscription.unsubscribe();
						await logJobProgress(jobId, event);
					} else {
						await logJobProgress(jobId, event);
					}
				},
				onError: async error => {
					const errorMsg = error instanceof Error ? error.message : String(error);
					await onError?.(errorMsg);
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
		await onError?.(errorMsg);
		await logJobProgress(jobId, {
			type: jobType,
			status: "aborted",
			cause: "Could not subscribe to job events: " + errorMsg
		});
	}
}
