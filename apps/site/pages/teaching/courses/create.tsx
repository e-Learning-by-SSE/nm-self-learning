import { apiFetch } from "@self-learning/api";
import { CourseEditor, CourseFormModel } from "@self-learning/teaching";
import { showToast } from "@self-learning/ui/common";

async function createCourse(course: CourseFormModel): Promise<{ title: string; slug: string }> {
	return apiFetch<{ title: string; slug: string }, CourseFormModel>(
		"POST",
		"/api/teachers/courses/create",
		course
	);
}

export default function CreateCoursePage() {
	function onConfirm(course: CourseFormModel) {
		async function create() {
			try {
				const { title } = await createCourse(course);
				showToast({ type: "success", title: "Kurs erstellt!", subtitle: title });
			} catch (error) {
				showToast({
					type: "error",
					title: "Fehler",
					subtitle: JSON.stringify(error, null, 2)
				});
			}
		}
		create();
	}

	return (
		<div className="grow bg-gray-50">
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
		</div>
	);
}
