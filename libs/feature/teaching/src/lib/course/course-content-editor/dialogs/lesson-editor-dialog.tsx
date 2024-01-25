import { Dialog, DialogActions, OnDialogCloseFn, showToast } from "@self-learning/ui/common";
import { useRequiredSession } from "@self-learning/ui/layouts";
import { useState } from "react";
import { LessonFormModel } from "@self-learning/teaching";
import { trpc } from "@self-learning/api-client";
import { LessonEditorFormProvider } from "../../../../../../lesson/src/lib/lesson-editor";

export function CreateLessonDialog() {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [createLessonDialogOpen, setCreateLessonDialogOpen] = useState(false);
	const { mutateAsync: createLessonAsync } = trpc.lesson.create.useMutation();

	async function handleCreateDialogClose(lesson?: LessonFormModel) {
		if (!lesson) {
			return setCreateLessonDialogOpen(false);
		}

		try {
			console.log("Creating lesson...", lesson);
			const result = await createLessonAsync(lesson);
			showToast({ type: "success", title: "Lernheit erstellt", subtitle: result.title });
			setCreateLessonDialogOpen(false);
		} catch (error) {
			console.error(error);
			showToast({
				type: "error",
				title: "Fehler",
				subtitle: "Lerneinheit konnte nicht erstellt werden."
			});
		}
	}

	return <LessonEditorDialog onClose={handleCreateDialogClose}></LessonEditorDialog>;
}

export function EditLessonDialog({ initialLesson }: { initialLesson?: LessonFormModel }) {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [lessonEditorDialog, setLessonEditorDialog] = useState(false);
	const { mutateAsync: editLessonAsync } = trpc.lesson.edit.useMutation();
	const handleEditDialogClose: OnDialogCloseFn<LessonFormModel> = async updatedLesson => {
		if (!updatedLesson) {
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
			setLessonEditorDialog(false);
		} catch (error) {
			showToast({
				type: "error",
				title: "Fehler",
				subtitle: "Die Lernheit konnte nicht gespeichert werden."
			});
		}
	};

	return (
		<LessonEditorDialog
			initialLesson={initialLesson}
			onClose={handleEditDialogClose}
		></LessonEditorDialog>
	);
}

export function LessonEditorDialog({
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

	const isNew = !initialLesson;

	if (initialLesson?.lessonId && !canEdit) {
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

	return (
		<Dialog
			title={isNew ? "Neue Lernheit erstellen" : "Lerneinheit anpassen"}
			onClose={() => window.confirm("Änderungen verwerfen?") && onClose(undefined)}
			style={{ height: "80vh", width: "80vw" }}
		>
			<LessonEditorFormProvider onClose={onClose} initialLesson={initialLesson} />
		</Dialog>
	);
}
