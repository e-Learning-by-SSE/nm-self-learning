import { trpc } from "@self-learning/api-client";
import { database } from "@self-learning/database";
import { QuizContent } from "@self-learning/question-types";
import { LessonEditor, LessonFormModel } from "@self-learning/teaching";
import { LessonContent } from "@self-learning/types";
import { showToast } from "@self-learning/ui/common";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";

type EditLessonProps = {
	lesson: LessonFormModel;
};

export const getServerSideProps: GetServerSideProps<EditLessonProps> = async ({ params }) => {
	const lessonId = params?.lessonId;

	if (typeof lessonId !== "string") {
		throw new Error("No [lessolessonIdnSlug] provided.");
	}

	const lesson = await database.lesson.findUnique({
		where: { lessonId },
		select: {
			lessonId: true,
			slug: true,
			title: true,
			subtitle: true,
			description: true,
			content: true,
			quiz: true,
			imgUrl: true,
			authors: true
		}
	});

	if (!lesson) {
		return { notFound: true };
	}

	const lessonForm: LessonFormModel = {
		lessonId: lesson.lessonId,
		slug: lesson.slug,
		title: lesson.title,
		subtitle: lesson.subtitle,
		description: lesson.description,
		imgUrl: lesson.imgUrl,
		authors: lesson.authors.map(a => ({ slug: a.slug })),
		// Need type casting because JsonArray from prisma causes error
		content: (lesson.content ?? []) as LessonContent,
		quiz: (lesson.quiz ?? []) as QuizContent
	};

	return {
		props: { lesson: lessonForm }
	};
};

export default function EditLessonPage({ lesson }: EditLessonProps) {
	const router = useRouter();
	const { mutateAsync: updateLesson } = trpc.lesson.edit.useMutation();

	async function onConfirm(updatedLesson: LessonFormModel) {
		try {
			const result = await updateLesson({
				lesson: updatedLesson,
				lessonId: lesson.lessonId as string
			});

			showToast({
				type: "success",
				title: "Änderungen gespeichert!",
				subtitle: result.title
			});

			router.replace(router.asPath, undefined, { scroll: false });
		} catch (error) {
			showToast({
				type: "error",
				title: "Fehler",
				subtitle:
					"Das Speichern der Lerneinheit ist fehlgeschlagen. Siehe Konsole für mehr Informationen."
			});
		}
	}

	return <LessonEditor lesson={lesson} onConfirm={onConfirm} />;
}
