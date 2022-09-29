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
export function useEnrollmentMutations(courseSlug: string) {
	const ctx = trpc.useContext();

	const { mutate: enroll } = trpc.enrollment.enroll.useMutation({
		onSettled() {
			ctx.enrollment.getEnrollments.invalidate();
		}
	});

	const { mutate: disenroll } = trpc.enrollment.disenroll.useMutation({
		onSettled() {
			ctx.enrollment.getEnrollments.invalidate();
		}
	});

	return { enroll, disenroll };
}
