import { apiFetch } from "@self-learning/api";
import { database } from "@self-learning/database";
import { LessonEditor } from "@self-learning/teaching";
import { Lesson, lessonSchema } from "@self-learning/types";
import { GetServerSideProps } from "next";

type EditLessonProps = {
	lesson: Lesson;
};

async function editLesson(lesson: Lesson) {
	return apiFetch<Lesson, Lesson>("PUT", `/api/teachers/lessons/edit/${lesson.lessonId}`, lesson);
}

export const getServerSideProps: GetServerSideProps<EditLessonProps> = async ({ params }) => {
	const slug = params?.lessonSlug;

	if (typeof slug !== "string") {
		throw new Error("No [lessonSlug] provided.");
	}

	const lessonFromDb = await database.lesson.findUnique({
		where: { slug }
	});

	if (!lessonFromDb) {
		return { notFound: true };
	}

	const lesson = lessonSchema.parse(lessonFromDb);

	return {
		props: { lesson }
	};
};

export default function EditLessonPage({ lesson }: EditLessonProps) {
	async function onConfirm(updatedLesson: Lesson) {
		const result = await editLesson({
			...updatedLesson,
			lessonId: lesson.lessonId
		});

		console.log(result);

		// Open updated lesson in a new tab
		window.open(`/courses/python-tutorial/${result.slug}`, "_blank");
	}

	return <LessonEditor lesson={lesson as any} onConfirm={onConfirm as any} />;
}
