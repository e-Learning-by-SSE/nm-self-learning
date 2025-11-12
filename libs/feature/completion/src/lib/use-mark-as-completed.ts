import { AppRouter } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { inferRouterInputs } from "@trpc/server";
import { useSession } from "next-auth/react";
import { useCallback } from "react";

type MarkAsCompletedInput = inferRouterInputs<AppRouter>["completion"]["markAsCompleted"];

export function useMarkAsCompleted<T extends Record<string, unknown>>(onSettled?: () => void) {
	const session = useSession();

	const { mutate } = trpc.completion.markAsCompleted.useMutation({
		onSettled(data, error) {
			console.log(data);
			console.log(error);
		}
	});

	const markAsCompleted = useCallback(
		(input: MarkAsCompletedInput) => {
			const username = session.data?.user?.name;

			if (!username) {
				console.error("markAsCompleted was called without a logged in user.");
				return () => {
					/** NOOP */
				};
			}

			return mutate(input, {
				onSettled: (data, error) => {
					if (!error) {
						console.log("Mutation successful:", data);
					} else {
						console.error("Mutation error:", error);
					}

					if (onSettled) {
						onSettled();
					}
				}
			});
		},
		[session.data?.user?.name, mutate, onSettled]
	);

	return markAsCompleted;
}
