import { Dialog, DialogActions, OnDialogCloseFn } from "@self-learning/ui/common";
import { useRequiredSession } from "@self-learning/ui/layouts";
import { LessonFormModel } from "@self-learning/teaching";
import { trpc } from "@self-learning/api-client";
import {
	LessonEditor,
	onLessonCreatorClosed,
	onLessonEditorClosed
} from "../../../../../../lesson/src/lib/lesson-editor";

interface CreateLessonDialogProps {
	setCreateLessonDialogOpen: (open: boolean) => void;
}

export function CreateLessonDialog({ setCreateLessonDialogOpen }: CreateLessonDialogProps) {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

	return <LessonEditorDialog onClose={handleCreateDialogClose} />;
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

	return <LessonEditorDialog initialLesson={initialLesson} onClose={handleEditDialogClose} />;
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
			<LessonEditor onClose={onClose} initialLesson={initialLesson} />
		</Dialog>
	);
}
