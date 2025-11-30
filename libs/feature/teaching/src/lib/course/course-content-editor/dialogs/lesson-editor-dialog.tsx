import { AccessLevel } from "@prisma/client";
import { LessonEditor, LessonFormModel } from "@self-learning/teaching";
import { Dialog, OnDialogCloseFn } from "@self-learning/ui/common";
import { ResourceGuard } from "@self-learning/ui/layouts";
import Link from "next/link";

export function LessonEditorDialogWithGuard({
	onClose,
	initialLesson
}: {
	onClose: OnDialogCloseFn<LessonFormModel>;
	initialLesson?: LessonFormModel;
}) {
	return (
		<ResourceGuard accessLevel={AccessLevel.EDIT} allowedGroups={initialLesson?.permissions}>
			<LessonEditorDialog initialLesson={initialLesson} onClose={onClose} />
		</ResourceGuard>
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
