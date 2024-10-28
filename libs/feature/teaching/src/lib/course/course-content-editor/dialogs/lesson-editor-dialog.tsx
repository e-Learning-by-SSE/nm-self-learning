import { Dialog, OnDialogCloseFn } from "@self-learning/ui/common";
import { Unauthorized, useRequiredSession } from "@self-learning/ui/layouts";
import { LessonEditor, LessonFormModel } from "@self-learning/teaching";
import React from "react";

export function LessonEditorDialogWithGuard({
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
