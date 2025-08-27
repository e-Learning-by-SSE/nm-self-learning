import { LessonEditor, LessonFormModel } from "@self-learning/teaching";
import { Dialog, OnDialogCloseFn } from "@self-learning/ui/common";
import { Unauthorized, useRequiredSession } from "@self-learning/ui/layouts";
import Link from "next/link";

export function LessonEditorDialogWithGuard({
	onClose,
	initialLesson
}: {
	onClose: OnDialogCloseFn<LessonFormModel>;
	initialLesson?: LessonFormModel;
}) {
	const session = useRequiredSession();
	// Admins can edit everything
	const isAdmin = session.data?.user.role === "ADMIN";
	// All Authors can edit new lessons
	const isAuthorOfNewLesson = initialLesson === undefined && session.data?.user.isAuthor;
	// Authors can edit their own lessons
	const isAuthorOfLesson = initialLesson?.authors.some(
		a => a.username === session.data?.user.name
	);
	const canEdit = isAdmin || isAuthorOfNewLesson || isAuthorOfLesson;

	return (
		<div>
			{canEdit ? (
				<LessonEditorDialog initialLesson={initialLesson} onClose={onClose} />
			) : (
				<Unauthorized />
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
			title={!initialLesson ? "Lerneinheit erstellen" : "Lerneinheit bearbeiten"}
			onClose={() => window.confirm("Änderungen verwerfen?") && onClose(undefined)}
			style={{ height: "80vh", width: "80vw" }}
		>
			<div className="absolute right-8 top-8 flex gap-4">
				<Link
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
				</Link>
			</div>
			<div className={"overflow-y-auto"}>
				<LessonEditor
					onSubmit={onClose}
					initialLesson={initialLesson}
					isFullScreen={false}
				/>
			</div>
		</Dialog>
	);
}
