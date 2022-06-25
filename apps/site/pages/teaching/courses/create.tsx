import { apiFetch } from "@self-learning/api";
import { CourseEditor, CourseFormModel } from "@self-learning/teaching";
import { CenteredContainer } from "@self-learning/ui/layouts";
import { useState } from "react";

async function createCourse(course: CourseFormModel): Promise<{ title: string; slug: string }> {
	return apiFetch<{ title: string; slug: string }, CourseFormModel>(
		"POST",
		"/api/teachers/courses/create",
		course
	);
}

export default function CreateCoursePage() {
	const [error, setError] = useState<unknown>(null);

	function onConfirm(course: CourseFormModel) {
		async function create() {
			try {
				setError(null);
				await createCourse(course);
			} catch (error) {
				setError(error);
			}
		}
		create();
	}

	return (
		<div className="grow bg-gray-50">
			<>
				{error && (
					<CenteredContainer className="p-4">
						<pre className="rounded-lg bg-red-50 p-8 text-xs text-red-500">
							{JSON.stringify(error, null, 4)}
						</pre>
					</CenteredContainer>
				)}
				<CourseEditor
					onConfirm={onConfirm}
					course={{
						courseId: "",
						title: "",
						slug: "",
						description: "",
						subtitle: "",
						imgUrl: "",
						subjectId: null,
						content: []
					}}
				/>
			</>
		</div>
	);
}
