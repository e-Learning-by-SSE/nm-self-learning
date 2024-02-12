import { Dialog, DialogActions, OnDialogCloseFn } from "@self-learning/ui/common";
import { useRequiredSession } from "@self-learning/ui/layouts";
import {
	LessonEditor,
	LessonFormModel,
	onLessonCreatorClosed,
	onLessonEditorClosed
} from "@self-learning/teaching";
import { trpc } from "@self-learning/api-client";
import React from "react";

export function CreateLessonDialog({
	setCreateLessonDialogOpen
}: {
	setCreateLessonDialogOpen: (open: boolean) => void;
}) {
	const { mutateAsync: createLessonAsync } = trpc.lesson.create.useMutation();

	async function handleCreateDialogClose(lesson?: LessonFormModel) {
		await onLessonCreatorClosed(
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
	setLessonEditorDialog
}: {
	initialLesson?: LessonFormModel;
	setLessonEditorDialog: (value: boolean) => void;
}) {
	const { mutateAsync: editLessonAsync } = trpc.lesson.edit.useMutation();
	const handleEditDialogClose: OnDialogCloseFn<LessonFormModel> = async updatedLesson => {
		await onLessonEditorClosed(
			() => {
				setLessonEditorDialog(false);
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
			title={!initialLesson ? "Neue Lernheit erstellen" : "Lerneinheit anpassen"}
			onClose={() => window.confirm("Änderungen verwerfen?") && onClose(undefined)}
			style={{ height: "80vh", width: "80vw" }}
		>
			<div className="absolute right-8 top-8 flex gap-4">
				<a
					className="btn-stroked"
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
			<LessonEditor onClose={onClose} initialLesson={initialLesson} />
		</Dialog>
	);
}

function NoPermissionToEditComponent({
	onClose,
	initialLesson
}: {
	onClose: OnDialogCloseFn<LessonFormModel>;
	initialLesson?: LessonFormModel;
}) {
	if (!initialLesson) return <></>;

	return (
		<Dialog title="Nicht erlaubt" onClose={onClose}>
			<div className="flex flex-col gap-8">
				<p className="text-light">
					Du hast keine Berechtigung, diese Lerneinheit zu bearbeiten:
				</p>

				<div className="flex flex-col">
					<span className="font-semibold">Titel:</span>
					<span className="font-semibold text-secondary">{initialLesson.title}</span>
				</div>

				<div>
					<span className="font-semibold">Autoren:</span>

					<ul className="flex flex-col">
						{initialLesson.authors.map(a => (
							<span className="font-semibold text-secondary">{a.username}</span>
						))}
					</ul>
				</div>
			</div>
			<DialogActions onClose={onClose} />
		</Dialog>
	);
}
