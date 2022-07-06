import { trpc } from "@self-learning/api-client";
import { useSession } from "next-auth/react";

export function useEnrollments() {
	const session = useSession();
	const username = session.data?.user?.name as string;

	const { data } = trpc.useQuery(["user-enrollments.getEnrollments"], { enabled: !!username });

	return data;
}

/**
 * Provides hooks for signing up to courses and out of courses.
 */
export function useEnrollmentMutations(courseSlug: string) {
	const { mutate: enroll } = trpc.useMutation("user-enrollments.enroll", {
		onSettled() {
			trpc.useContext().invalidateQueries(["user-enrollments.getEnrollments"]);
		}
	});

	const { mutate: disenroll } = trpc.useMutation("user-enrollments.disenroll", {
		onSettled() {
			trpc.useContext().invalidateQueries(["user-enrollments.getEnrollments"]);
		}
	});

	return { enroll, disenroll };
}
