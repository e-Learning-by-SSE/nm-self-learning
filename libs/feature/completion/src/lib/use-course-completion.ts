import { trpc } from "@self-learning/api-client";

export function useCourseCompletion(courseSlug: string) {
	const { data: courseCompletion } = trpc.completion.getCourseCompletion.useQuery({ courseSlug });
	return courseCompletion;
}
