import { Prisma } from "@prisma/client";
import { apiFetch } from "@self-learning/api";
import { LessonEditor, LessonFormModel } from "@self-learning/teaching";

type Lesson = Prisma.LessonCreateInput;

async function createLesson(lesson: LessonFormModel) {
	return apiFetch<Lesson, LessonFormModel>("POST", "/api/teachers/lessons/create", lesson);
}

export default function CreateLessonPage() {
	async function onConfirm(lesson: LessonFormModel) {
		const result = await createLesson(lesson);

		console.log(result);
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
