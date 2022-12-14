import { trpc } from "@self-learning/api-client";
import { useSession } from "next-auth/react";

export function useEnrollments() {
	const session = useSession();
	const username = session.data?.user?.name as string;

	const { data } = trpc.enrollment.getEnrollments.useQuery(undefined, {
		enabled: !!username
	});

	return data;
}

/**
 * Provides hooks for signing up to courses and out of courses.
 */
export function useEnrollmentMutations() {
	const { mutate: enroll } = trpc.enrollment.enroll.useMutation();
	const { mutate: disenroll } = trpc.enrollment.disenroll.useMutation();

	return { enroll, disenroll };
}
