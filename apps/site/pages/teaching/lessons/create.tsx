import { trpc } from "@self-learning/api-client";
import { LessonEditor, LessonFormModel } from "@self-learning/teaching";
import { showToast } from "@self-learning/ui/common";
import { Unauthorized } from "@self-learning/ui/layouts";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function CreateLessonPage() {
	const { mutateAsync: createLesson } = trpc.lesson.create.useMutation();
	const session = useSession({ required: true });
	const author = session.data?.user.author;
	const router = useRouter();

	async function onConfirm(lesson: LessonFormModel) {
		try {
			const result = await createLesson(lesson);
			console.log(result);
			showToast({
				type: "success",
				title: "Lerneinheit erstellt!",
				subtitle: result.title
			});
			router.push(`/teaching/lessons/edit/${result.lessonId}`);
		} catch (error) {
			showToast({
				type: "error",
				title: "Fehler",
				subtitle:
					"Die Lernheit konnte nicht erstellt werden. Siehe Konsole für mehr Informationen."
			});
		}
	}

	if (!author) {
		return (
			<Unauthorized>Um eine Lerneinheit zu erstellen, musst du ein Autor sein.</Unauthorized>
		);
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
				quiz: { questions: [], config: null },
				content: [],
				authors: [{ slug: author.slug }]
			}}
		/>
	);
}
