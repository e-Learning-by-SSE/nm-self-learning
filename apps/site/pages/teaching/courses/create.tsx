import { apiFetch } from "@self-learning/api";
import { CourseEditor } from "@self-learning/teaching";

async function createCourse(course: any) {
	return apiFetch("POST", "/api/teachers/courses/create");
}

export default function CreateCoursePage() {
	return (
		<div className="grow bg-gray-50">
			<CourseEditor
				course={{
					courseId: "",
					title: "",
					slug: "",
					description: "",
					subtitle: "",
					imgUrl: "",
					subjectId: -1,
					content: []
				}}
			/>
		</div>
	);
}
