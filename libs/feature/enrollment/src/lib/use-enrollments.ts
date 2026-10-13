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
	const utils = trpc.useUtils();
	// Refresh the enrollment list so the UI reflects the change without a reload.
	const onSuccess = () => utils.enrollment.getEnrollments.invalidate();
	const { mutate: enroll } = trpc.enrollment.enroll.useMutation({ onSuccess });
	const { mutate: disenroll } = trpc.enrollment.disenroll.useMutation({ onSuccess });

	return { enroll, disenroll };
}
