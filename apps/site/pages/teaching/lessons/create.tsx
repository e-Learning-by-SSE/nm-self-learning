import { LessonType } from "@prisma/client";
import { trpc } from "@self-learning/api-client";
import { LessonEditor, LessonFormModel } from "@self-learning/teaching";
import { showToast } from "@self-learning/ui/common";
import { Unauthorized, useRequiredSession } from "@self-learning/ui/layouts";
import { useRouter } from "next/router";

export default function CreateLessonPage() {
	const { mutateAsync: createLesson } = trpc.lesson.create.useMutation();
	const session = useRequiredSession();
	const authorUsername = session.data?.user.name;
	const router = useRouter();

	async function onConfirm(lesson: LessonFormModel) {
		//don't save lesson without content
		if (lesson.content.length === 0) {
			showToast({
				type: "error",
				title: "Fehler",
				subtitle:
					"Die Lernheit konnte nicht erstellt werden. Es muss mindestens ein Inhaltselement vorhanden sein."
			});
			return;
		}
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

	if (!authorUsername) {
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
				licenseId: null,
				quiz: { questions: [], config: null },
				content: [],
				authors: [{ username: authorUsername ?? "" }],
				lessonType: LessonType.TRADITIONAL,
				selfRegulatedQuestion: null
			}}
		/>
	);
}
