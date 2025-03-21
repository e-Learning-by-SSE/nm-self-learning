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

	const { data: draft, isLoading } = trpc.lessonDraft.getById.useQuery({
		draftId: draftId ?? ""
	});

	if (isLoading) {
		return <p>Loading...</p>;
	}

	if (!draft) {
		return <p>No draft found.</p>;
	}

	let lessonForm: LessonFormModel = createEmptyLesson();
	if (draft) {
		lessonForm = {
			lessonId: draft.lessonId ?? null,
			slug: draft.slug ?? "",
			title: draft.title ?? "",
			subtitle: draft.subtitle,
			description: draft.description,
			imgUrl: draft.imgUrl,
			authors: Array.isArray(draft.authors) ? draft.authors : [JSON.parse("[]")],
			licenseId: draft.licenseId ?? null,
			requirements: Array.isArray(draft.requirements)
				? draft.requirements
				: [JSON.parse("[]")],
			teachingGoals: Array.isArray(draft.teachingGoals)
				? draft.teachingGoals
				: JSON.parse("[]"),
			content: (draft.content ?? []) as LessonContent,
			quiz: draft.quiz as Quiz,
			lessonType: draft.lessonType ?? "TRADITIONAL",
			selfRegulatedQuestion: draft.selfRegulatedQuestion ?? null
		};
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
