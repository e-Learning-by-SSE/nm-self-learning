import { Lesson } from "@prisma/client";
import { apiFetch } from "@self-learning/api";
import { database } from "@self-learning/database";
import { LessonEditor } from "@self-learning/teaching";
import {} from "@self-learning/types";
import { showToast } from "@self-learning/ui/common";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";

type EditLessonProps = {
	lesson: Lesson;
};

async function editLesson(lesson: Lesson) {
	return apiFetch<Lesson, Lesson>("PUT", `/api/teachers/lessons/edit/${lesson.lessonId}`, lesson);
}

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

	async function onConfirm(updatedLesson: Lesson) {
		try {
			const result = await editLesson({
				...updatedLesson,
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

	return <LessonEditor lesson={lesson as any} onConfirm={onConfirm as any} />;
}
