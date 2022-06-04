import { CourseCompletion } from "@self-learning/types";
import { useSession } from "next-auth/react";
import { useQuery } from "react-query";

async function fetchCourseCompletion(courseSlug: string, username: string) {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/api/users/${username}/courses/${courseSlug}/completion`
	);

	if (!response.ok) {
		throw new Error(await response.text());
	}

	return (await response.json()) as CourseCompletion;
}

export function useCourseCompletion(courseSlug: string) {
	const session = useSession();

	const { data: courseCompletion } = useQuery(
		["course-completion"],
		() => fetchCourseCompletion(courseSlug, session.data?.user?.name as string),
		{ enabled: !!session.data?.user?.name }
	);

	return courseCompletion;
}
