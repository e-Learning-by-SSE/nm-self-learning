import { trpc } from "@self-learning/api-client";

export function useCourseCompletion(courseSlug: string) {
	const { data: courseCompletion } = trpc.useQuery([
		"user-completion.getCourseCompletion",
		{ courseSlug }
	]);
	return courseCompletion;
}
