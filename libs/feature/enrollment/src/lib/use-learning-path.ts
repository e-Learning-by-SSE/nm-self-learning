import { trpc } from "@self-learning/api-client";
import { useSession } from "next-auth/react";

export function usePersonalLearningPaths() {
	const session = useSession();
	const username = session.data?.user?.name as string;

	const { data } = trpc.enrollment.getLearningPaths.useQuery(undefined, {
		enabled: !!username
	});

	return data;
}
