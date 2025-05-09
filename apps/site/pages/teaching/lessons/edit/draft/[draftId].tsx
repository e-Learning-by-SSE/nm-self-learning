import { trpc } from "@self-learning/api-client";
import {
	LessonEditor,
	LessonFormModel,
	onLessonCreatorSubmit,
	onLessonEditorSubmit
} from "@self-learning/teaching";
import { LessonContent } from "@self-learning/types";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { withAuth } from "@self-learning/api";
import { Quiz } from "@self-learning/quiz";
import { createEmptyLesson } from "@self-learning/types";
import { useRequiredSession } from "@self-learning/ui/layouts";
import { useMemo } from "react";

type EditLessonDraftProps = {
	draftId: string;
};
export const getServerSideProps: GetServerSideProps = withAuth<EditLessonDraftProps>(async ctx => {
	const draftId = Array.isArray(ctx.params?.draftId)
		? ctx.params?.draftId[0]
		: (ctx.params?.draftId ?? "");

	return {
		props: { draftId: draftId }
	};
});

export default function EditDraftPage({ draftId }: EditLessonDraftProps) {
	const { mutateAsync: editLessonAsync } = trpc.lesson.edit.useMutation();
	const { mutateAsync: createLessonAsync } = trpc.lesson.create.useMutation();
	const { mutateAsync: deleteDraft } = trpc.lessonDraft.delete.useMutation();
	const router = useRouter();

	const { data: draft, isLoading } = trpc.lessonDraft.getById.useQuery(
		{ draftId: draftId ?? "" },
		{
			refetchOnWindowFocus: false,
			refetchOnReconnect: false,
			refetchInterval: false,
			staleTime: 5 * 60 * 1000
		}
	);

	const lessonForm = useMemo(() => {
		if (!draft) return createEmptyLesson();

		return {
			lessonId: draft.lessonId ?? null,
			slug: draft.slug ?? "",
			title: draft.title ?? "",
			subtitle: draft.subtitle,
			description: draft.description,
			imgUrl: draft.imgUrl,
			authors: Array.isArray(draft.authors) ? draft.authors : [JSON.parse("[]")],
			licenseId: draft.licenseId ?? null,
			requires: Array.isArray(draft.requires) ? draft.requires : [JSON.parse("[]")],
			provides: Array.isArray(draft.provides) ? draft.provides : JSON.parse("[]"),
			content: (draft.content ?? []) as LessonContent,
			quiz: draft.quiz as Quiz,
			lessonType: draft.lessonType ?? "TRADITIONAL",
			selfRegulatedQuestion: draft.selfRegulatedQuestion ?? null
		};
	}, [draft]);

	async function handleEditClose(lesson?: LessonFormModel) {
		if (lesson) {
			if (lesson.lessonId) {
				await onLessonEditorSubmit(
					() => {
						router.push("/dashboard/author");
					},
					editLessonAsync,
					lesson
				);
			} else {
				await onLessonCreatorSubmit(
					() => {
						router.push("/dashboard/author");
					},
					createLessonAsync,
					lesson
				);
			}
			await deleteDraft({ draftId: draftId });
		}
	}

	if (isLoading) {
		return <p>Loading...</p>;
	}

	if (!draft) {
		return <p>No draft found.</p>;
	}

	return (
		<LessonEditor
			initialLesson={lessonForm}
			onSubmit={handleEditClose}
			isFullScreen={true}
			draftId={draftId}
			isOverwritten={false}
			redirectPath="/dashboard/author"
		/>
	);
}
