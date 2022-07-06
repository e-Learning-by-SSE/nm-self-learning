import { Lesson } from "@prisma/client";
import { trpc } from "@self-learning/api-client";
import { database } from "@self-learning/database";
import { LessonEditor, LessonFormModel } from "@self-learning/teaching";
import {} from "@self-learning/types";
import { showToast } from "@self-learning/ui/common";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";

type EditLessonProps = {
	lesson: Lesson;
};

export const getServerSideProps: GetServerSideProps<EditLessonProps> = async ({ params }) => {
	const lessonId = params?.lessonId;

	if (typeof lessonId !== "string") {
		throw new Error("No [lessolessonIdnSlug] provided.");
	}

	const lesson = await database.lesson.findUnique({
		where: { lessonId }
	});

	if (!lesson) {
		return { notFound: true };
	}

	return {
		props: { lesson }
	};
};

export default function EditLessonPage({ lesson }: EditLessonProps) {
	const router = useRouter();
	const { mutateAsync: updateLesson } = trpc.useMutation("lessons.edit");

	async function onConfirm(updatedLesson: LessonFormModel) {
		try {
			const result = await updateLesson({
				lesson: updatedLesson,
				lessonId: lesson.lessonId
			});

			showToast({
				type: "success",
				title: "Änderungen gespeichert!",
				subtitle: result.title
			});

			router.replace(router.asPath);
		} catch (error) {
			showToast({
				type: "error",
				title: "Fehler",
				subtitle:
					"Das Speichern der Lerneinheit ist fehlgeschlagen. Siehe Konsole für mehr Informationen."
			});
		}
	}

	return <LessonEditor lesson={lesson as LessonFormModel} onConfirm={onConfirm} />;
}
