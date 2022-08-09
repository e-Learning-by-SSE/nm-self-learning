import { trpc } from "@self-learning/api-client";

export function Lesson() {
	const { data: lesson } = trpc.useQuery(["lessons.findOne", { lessonId: "123" }]);

	if (!lesson) return <span>Loading...</span>;

	return (
		<div>
			<h1>{lesson.title}</h1>
			<p>by {lesson.authors[0].displayName}</p>
		</div>
	);
}
