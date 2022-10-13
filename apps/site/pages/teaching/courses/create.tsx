import { trpc } from "@self-learning/api-client";
import { CourseEditor, CourseFormModel } from "@self-learning/teaching";
import { showToast } from "@self-learning/ui/common";

export default function CreateCoursePage() {
	const { mutateAsync: createCourse } = trpc.course.create.useMutation();

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
					authors: [],
					content: []
				}}
			/>
		</div>
	);
}
