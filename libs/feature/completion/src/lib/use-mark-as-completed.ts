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

export function useMarkAsCompleted(lessonId: string, onSettled?: () => void) {
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

		return mutate(
			{ lessonId, username },
			{
				onSettled: (data, error) => {
					if (!error) {
						console.log(`Lesson ${lessonId} marked as completed.`);
						console.log(data);
					} else {
						console.error(error);
					}

					if (onSettled) {
						onSettled();
					}
				}
			}
		);
	}, [lessonId, session.data?.user?.name, mutate, onSettled]);

	return markAsCompleted;
}
