import { Dialog, OnDialogCloseFn } from "@self-learning/ui/common";
import { Unauthorized, useRequiredSession } from "@self-learning/ui/layouts";
import { LessonEditor, LessonFormModel } from "@self-learning/teaching";
import Link from "next/link";
import { useRouter } from "next/router";

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
	const router = useRouter();

	return (
		<Dialog
			title={!initialLesson ? "Neue Lerneinheit erstellen" : "Lerneinheit anpassen"}
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
							? `/${router.basePath}/teaching/lessons/edit/${initialLesson?.lessonId}`
							: `/${router.basePath}/teaching/lessons/create`
					}
					title="Formular in einem neuen Tab öffnen. Änderungen werden nicht übernommen."
				>
					Im separaten Editor öffnen
				</Link>
			</div>
			<LessonEditor onSubmit={onClose} initialLesson={initialLesson} isFullScreen={false} />
		</Dialog>
	);
}
