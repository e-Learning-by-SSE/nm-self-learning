import { useSession } from "next-auth/react";
import { useCallback } from "react";
import { useMutation, useQueryClient } from "react-query";

async function fetchMarkAsCompleted(vars: { lessonId: string; username: string }) {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/api/users/${vars.username}/lessons/${vars.lessonId}/mark-as-completed`,
		{ method: "POST" }
	);

	if (!response.ok) {
		throw new Error(await response.text());
	}

	return true;
}

export function useMarkAsCompleted(lessonId: string) {
	const session = useSession();
	const queryClient = useQueryClient();

	const { mutate } = useMutation(fetchMarkAsCompleted, {
		onSettled: (data, error) => {
			console.log(data);
			console.log(error);
			queryClient.invalidateQueries(["course-completion"]);
		}
	});

	const markAsCompleted = useCallback(() => {
		const username = session.data?.user?.name;

		if (!username) {
			console.error("markAsCompleted was called without a logged in user.");
			return () => {
				/** NOOP */
			};
		}

		return mutate({ lessonId, username });
	}, [lessonId, session.data?.user?.name, mutate]);

	return markAsCompleted;
}
