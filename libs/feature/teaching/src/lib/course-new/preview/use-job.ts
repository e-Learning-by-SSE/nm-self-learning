import { trpc } from "@self-learning/api-client";
import { skipToken } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const MAX_POLL_ATTEMPTS = 45;
const TIMEOUT_MS = 25_000;

type JobMutation<TInput> = {
	useMutation: () => {
		mutate: (input: TInput) => void;
		data: string | undefined;
		error: { message: string } | null;
	};
};
/**
 * Starts a job mutation and polls its status.
 * The mutation must return a job id.
 * @param procedure - mutation which starts the job and returns jobId
 * @param input - input to the mutation. If undefined - job is not triggered
 * @returns object with job result and flags
 */
export function useJob<TInput>(procedure: JobMutation<TInput>, input: TInput | undefined) {
	const { mutate, data: jobId, error: mutationError } = procedure.useMutation();
	// Compare by value so a new object each render does not submit again.
	const inputKey = JSON.stringify(input ?? null);

	const [isTimedOut, setIsTimedOut] = useState(false);

	// Submits the job when the input appears.
	useEffect(() => {
		if (inputKey === "null") return;

		mutate(JSON.parse(inputKey) as TInput);
	}, [inputKey, mutate]);

	useEffect(() => {
		if (!jobId) return;

		const timer = setTimeout(() => {
			setIsTimedOut(true);
		}, TIMEOUT_MS);

		return () => clearTimeout(timer);
	}, [jobId]);

	// Poll until the job reaches a terminal status.
	const job = trpc.jobQueue.getStatus.useQuery(jobId ? { jobId } : skipToken, {
		refetchInterval: query => {
			const status = query.state.data?.status;
			if (query.state.dataUpdateCount >= MAX_POLL_ATTEMPTS) return false;
			return status === "FINISHED" || status === "ABORTED" || isTimedOut ? false : 1000;
		}
	});

	const isTerminal = job.data?.status === "FINISHED" || job.data?.status === "ABORTED";

	let error: { message: string } | null = null;
	if (mutationError) {
		error = { message: mutationError.message };
	} else if (job.data?.cause) {
		error = { message: job.data.cause };
	} else if (job.data?.status === "ABORTED") {
		error = { message: "Unknown error" };
	} else if (isTimedOut && !isTerminal) {
		error = { message: "timeout" };
	}

	return {
		data: job.data,
		error,
		isError: error !== null,
		isSuccess: job.data?.status === "FINISHED" && error === null,
		isPending: !!input && job.data?.status !== "FINISHED" && error === null
	};
}
