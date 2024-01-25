import { Unauthorized, useRequiredSession } from "@self-learning/ui/layouts";
import { LessonEditorFormProvider } from "../../../../../libs/feature/lesson/src/lib/lesson-editor";
import { LessonFormModel } from "@self-learning/teaching";
import { showToast } from "@self-learning/ui/common";
import { trpc } from "@self-learning/api-client";
import { useRouter } from "next/router";

export default function CreateLessonPage() {
	const session = useRequiredSession();
	const authorUsername = session.data?.user.name;
	const { mutateAsync: createLessonAsync } = trpc.lesson.create.useMutation();
	const router = useRouter();
	if (!authorUsername) {
		return (
			<Unauthorized>Um eine Lerneinheit zu erstellen, musst du ein Autor sein.</Unauthorized>
		);
	}

	async function handleCreateClose(lesson?: LessonFormModel) {
		if (!lesson) {
			router.push(document.referrer);
			return;
		}
		try {
			console.log("Creating lesson...", lesson);
			const result = await createLessonAsync(lesson);
			showToast({ type: "success", title: "Lernheit erstellt", subtitle: result.title });
			router.push(document.referrer);
		} catch (error) {
			console.error(error);
			showToast({
				type: "error",
				title: "Fehler",
				subtitle: "Lerneinheit konnte nicht erstellt werden."
			});
		}
	}

	return <LessonEditorFormProvider onClose={handleCreateClose} />;
}
