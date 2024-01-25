import { authOptions } from "@self-learning/api";
import { database } from "@self-learning/database";
import { Quiz } from "@self-learning/quiz";
import { LessonFormModel } from "@self-learning/teaching";
import { LessonContent } from "@self-learning/types";
import { GetServerSideProps } from "next";
import { unstable_getServerSession } from "next-auth";
import {
	LessonEditor,
	onLessonEditorClosed
} from "../../../../../../libs/feature/lesson/src/lib/lesson-editor";
import { OnDialogCloseFn } from "@self-learning/ui/common";
import { useRouter } from "next/router";
import { trpc } from "@self-learning/api-client";

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
		await onLessonEditorClosed(
			() => {
				router.push(document.referrer);
			},
			editLessonAsync,
			updatedLesson
		);
	};

	return <LessonEditor initialLesson={lesson} onClose={handleEditClose} />;
}
