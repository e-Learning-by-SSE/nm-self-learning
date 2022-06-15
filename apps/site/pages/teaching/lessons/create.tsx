import { Prisma } from "@prisma/client";
import { apiFetch } from "@self-learning/api";
import { LessonEditor } from "@self-learning/teaching";

type Lesson = Prisma.LessonCreateInput;

async function createLesson(lesson: Lesson) {
	return apiFetch<Lesson, Lesson>("POST", "/api/teachers/lessons/create", lesson);
}

export default function CreateLessonPage() {
	async function onConfirm(lesson: Lesson) {
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
				content: []
			}}
		/>
	);
}
