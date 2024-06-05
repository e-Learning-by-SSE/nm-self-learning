import React from "react";
import { CourseOverview } from "../../../../libs/feature/teaching/src/lib/course/courseOverview/courseOverview";
import { trpc } from "@self-learning/api-client";
import { Props } from "next/script";

export default function Start(props: Props) {
	const { courseCompletion } = trpc.course.getCoursesWithCompletions.useQuery({
		username: "dumbledore"
	});
	console.log("coursesWithCompletions", coursesWithCompletions);
	console.log("chapterCompletion", chapterCompletion);
	console.log("completedLessons", completedLessons);

	return <CourseOverview completions={[]} />;
}
