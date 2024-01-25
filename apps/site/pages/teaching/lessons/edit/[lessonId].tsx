import { authOptions } from "@self-learning/api";
import { database } from "@self-learning/database";
import { Quiz } from "@self-learning/quiz";
import { LessonFormModel } from "@self-learning/teaching";
import { LessonContent } from "@self-learning/types";
import { GetServerSideProps } from "next";
import { unstable_getServerSession } from "next-auth";
import { LessonEditorFormProvider } from "../../../../../../libs/feature/lesson/src/lib/lesson-editor";
import { OnDialogCloseFn, showToast } from "@self-learning/ui/common";
import { trpc } from "@self-learning/api-client";
import { useRouter } from "next/router";

type EditLessonProps = {
	lesson: LessonFormModel;
};

export const getServerSideProps: GetServerSideProps<EditLessonProps> = async ctx => {
	const lessonId = ctx.params?.lessonId;

	if (typeof lessonId !== "string") {
		throw new Error("No [lessonId] provided.");
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
			licenseId: true,
			authors: true,
			lessonType: true,
			selfRegulatedQuestion: true
		}
	});

	if (!lesson) {
		return { notFound: true };
	}

	const session = await unstable_getServerSession(ctx.req, ctx.res, authOptions);

	if (!session) {
		return {
			redirect: {
				destination: "/login",
				permanent: false
			}
		};
	}

	if (
		session.user.role !== "ADMIN" &&
		(!session.user.isAuthor || !lesson.authors.some(a => a.username === session.user.name))
	) {
		return {
			redirect: {
				destination: "/403",
				permanent: false
			}
		};
	}

	const lessonForm: LessonFormModel = {
		lessonId: lesson.lessonId,
		slug: lesson.slug,
		title: lesson.title,
		subtitle: lesson.subtitle,
		description: lesson.description,
		imgUrl: lesson.imgUrl,
		authors: lesson.authors.map(a => ({ username: a.username })),
		licenseId: lesson.licenseId,
		// Need type casting because JsonArray from prisma causes error
		content: (lesson.content ?? []) as LessonContent,
		quiz: lesson.quiz as Quiz,
		lessonType: lesson.lessonType,
		selfRegulatedQuestion: lesson.selfRegulatedQuestion
	};

	return {
		props: { lesson: lessonForm }
	};
};

export default function EditLessonPage({ lesson }: EditLessonProps) {
	const { mutateAsync: editLessonAsync } = trpc.lesson.edit.useMutation();
	const router = useRouter();
	const handleEditClose: OnDialogCloseFn<LessonFormModel> = async updatedLesson => {
		if (!updatedLesson) {
			router.push(document.referrer);
			return;
		}

		try {
			const result = await editLessonAsync({
				lesson: updatedLesson,
				lessonId: updatedLesson.lessonId as string
			});
			showToast({
				type: "success",
				title: "Lerneinheit gespeichert!",
				subtitle: result.title
			});
			router.push(document.referrer);
		} catch (error) {
			showToast({
				type: "error",
				title: "Fehler",
				subtitle: "Die Lernheit konnte nicht gespeichert werden."
			});
		}
	};

	return <LessonEditorFormProvider initialLesson={lesson} onClose={handleEditClose} />;
}
