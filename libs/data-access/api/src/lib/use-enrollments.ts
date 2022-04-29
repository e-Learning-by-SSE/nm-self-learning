import { useMutation, useQueryClient } from "react-query";

/**
 * Provides hooks for signing up to courses and out of courses.
 */
export function useEnrollmentMutations() {
	const queryClient = useQueryClient();

	const signUpMutation = useMutation(
		(vars: { course: string; username: string }) => {
			return signUp(vars.course, vars.username);
		},
		{
			onSuccess: async data => {
				console.log(data);
				queryClient.invalidateQueries(["user"]);
			},
			onError: () => {
				queryClient.invalidateQueries(["user"]);
			}
		}
	);

	const signOutMutation = useMutation(
		(vars: { course: string; username: string }) => {
			return signOut(vars.course, vars.username);
		},
		{
			onSuccess: async data => {
				console.log(data);
				queryClient.invalidateQueries(["user"]);
			},
			onError: () => {
				queryClient.invalidateQueries(["user"]);
			}
		}
	);

	return { signUpMutation, signOutMutation };
}

async function signUp(course: string, username: string) {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/api/users/${username}/courses/${course}`,
		{
			method: "POST"
		}
	);

	if (!response.ok) {
		throw { status: response.status, statusText: response.statusText };
	}

	return response.json();
}

async function signOut(course: string, username: string) {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/api/users/${username}/courses/${course}`,
		{
			method: "DELETE"
		}
	);

	if (!response.ok) {
		throw { status: response.status, statusText: response.statusText };
	}

	return response.json();
}
