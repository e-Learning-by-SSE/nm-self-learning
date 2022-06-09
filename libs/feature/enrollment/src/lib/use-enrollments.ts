import { CourseEnrollment } from "@self-learning/types";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "react-query";

const cacheKey = ["user-enrollments"];

async function fetchEnrollments(username: string) {
	const response = await fetch(`/api/users/${username}/courses`);

	if (!response.ok) {
		throw { status: response.status, statusText: response.statusText };
	}

	return (await response.json()) as CourseEnrollment[];
}

export function useEnrollments() {
	const session = useSession();
	const username = session.data?.user?.name as string;

	const { data } = useQuery(cacheKey, () => fetchEnrollments(username), {
		enabled: !!username
	});

	return data;
}

/**
 * Provides hooks for signing up to courses and out of courses.
 */
export function useEnrollmentMutations(courseSlug: string) {
	const session = useSession();
	const username = session.data?.user?.name as string;
	const queryClient = useQueryClient();

	const { mutate: enroll } = useMutation(() => fetchEnroll(courseSlug, username), {
		onSettled: (data, error) => {
			queryClient.invalidateQueries(cacheKey);
			console.log("enroll", { data, error });
		}
	});

	const { mutate: disenroll } = useMutation(() => fetchDisenroll(courseSlug, username), {
		onSettled: (data, error) => {
			queryClient.invalidateQueries(cacheKey);
			console.log("disenroll", { data, error });
		}
	});

	return { enroll, disenroll };
}

async function fetchEnroll(course: string, username: string) {
	const response = await fetch(`/api/users/${username}/courses/${course}/enrollment/enroll`, {
		method: "POST"
	});

	if (!response.ok) {
		throw await response.json();
	}

	return response.json();
}

async function fetchDisenroll(course: string, username: string) {
	const response = await fetch(`/api/users/${username}/courses/${course}/enrollment/disenroll`, {
		method: "DELETE"
	});

	if (!response.ok) {
		throw await response.json();
	}

	return response.json();
}
