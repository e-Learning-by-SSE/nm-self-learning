import { trpc } from "@self-learning/api-client";
import { LessonEditor, LessonFormModel } from "@self-learning/teaching";
import { showToast } from "@self-learning/ui/common";

export default function CreateLessonPage() {
	const { mutateAsync: createLesson } = trpc.lesson.create.useMutation();

	async function onConfirm(lesson: LessonFormModel) {
		try {
			const result = await createLesson(lesson);
			console.log(result);
			showToast({
				type: "success",
				title: "Lerneinheit erstellt!",
				subtitle: result.title
			});
		} catch (error) {
			showToast({
				type: "error",
				title: "Fehler",
				subtitle:
					"Die Lernheit konnte nicht erstellt werden. Siehe Konsole für mehr Informationen."
			});
		}
	}

	return (
		<LessonEditor
			onConfirm={onConfirm}
			lesson={{
				lessonId: "",
				slug: "",
				title: "",
				subtitle: "",
				description: "",
				imgUrl: "",
				quiz: [],
				content: []
			}}
		/>
	);
}
