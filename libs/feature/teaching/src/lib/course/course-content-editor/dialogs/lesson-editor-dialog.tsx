import { Dialog, OnDialogCloseFn } from "@self-learning/ui/common";
import { useRequiredSession } from "@self-learning/ui/layouts";
import {
	LessonEditor,
	LessonFormModel,
	onLessonCreatorSubmit,
	onLessonEditorSubmit
} from "@self-learning/teaching";
import { trpc } from "@self-learning/api-client";
import React from "react";
import { NoPermissionToEditComponent } from "@self-learning/ui/forms";

export function CreateLessonDialog({
	setCreateLessonDialogOpen
}: {
	setCreateLessonDialogOpen: (open: boolean) => void;
}) {
	const { mutateAsync: createLessonAsync } = trpc.lesson.create.useMutation();

	async function handleCreateDialogClose(lesson?: LessonFormModel) {
		await onLessonCreatorSubmit(
			() => {
				setCreateLessonDialogOpen(false);
			},
			createLessonAsync,
			lesson
		);
	}

	return <LessonEditorDialogWithGuard onClose={handleCreateDialogClose} />;
}

export function EditLessonDialog({
	initialLesson,
	setLessonEditorDialogOpen
}: {
	initialLesson?: LessonFormModel;
	setLessonEditorDialogOpen: (value: boolean) => void;
}) {
	const { mutateAsync: editLessonAsync } = trpc.lesson.edit.useMutation();
	const handleEditDialogClose: OnDialogCloseFn<LessonFormModel> = async updatedLesson => {
		await onLessonEditorSubmit(
			() => {
				setLessonEditorDialogOpen(false);
			},
			editLessonAsync,
			updatedLesson
		);
	};

	return (
		<LessonEditorDialogWithGuard
			initialLesson={initialLesson}
			onClose={handleEditDialogClose}
		/>
	);
}

function LessonEditorDialogWithGuard({
	onClose,
	initialLesson
}: {
	onClose: OnDialogCloseFn<LessonFormModel>;
	initialLesson?: LessonFormModel;
}) {
	const session = useRequiredSession();
	const canEdit =
		session.data?.user.role === "ADMIN" ||
		initialLesson?.authors.some(a => a.username === session.data?.user.name);

	return (
		<div>
			{canEdit ? (
				<LessonEditorDialog initialLesson={initialLesson} onClose={onClose} />
			) : (
				<NoPermissionToEditComponent initialLesson={initialLesson} onClose={onClose} />
			)}
		</div>
	);
}

function LessonEditorDialog({
	onClose,
	initialLesson
}: {
	onClose: OnDialogCloseFn<LessonFormModel>;
	initialLesson?: LessonFormModel;
}) {
	return (
		<Dialog
			title={!initialLesson ? "Neue Lerneinheit erstellen" : "Lerneinheit anpassen"}
			onClose={() => window.confirm("Änderungen verwerfen?") && onClose(undefined)}
			style={{ height: "80vh", width: "80vw" }}
		>
			<div className="absolute right-8 top-8 flex gap-4">
				<a
					className="btn-stroked focus:primary hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
					target="_blank"
					rel="noreferrer"
					href={
						initialLesson
							? `/teaching/lessons/edit/${initialLesson?.lessonId}`
							: `/teaching/lessons/create`
					}
					title="Formular in einem neuen Tab öffnen. Änderungen werden nicht übernommen."
				>
					Im separaten Editor öffnen
				</a>
			</div>
			<LessonEditor onSubmit={onClose} initialLesson={initialLesson} isFullScreen={false} />
		</Dialog>
	);
}
