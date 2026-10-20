import { AccessLevel } from "@prisma/client";
import { LessonEditor, LessonFormModel } from "@self-learning/teaching";
import { Dialog, DialogActions, OnDialogCloseFn } from "@self-learning/ui/common";
import { useRequiredSession, useResourceGuard } from "@self-learning/ui/layouts";
import { useTranslation } from "next-i18next";

export function LessonEditorDialogWithGuard({
	onClose,
	initialLesson,
	courseId,
	inheritedPermissions
}: {
	onClose: OnDialogCloseFn<LessonFormModel>;
	initialLesson?: LessonFormModel;
	courseId?: string;
	inheritedPermissions?: LessonFormModel["permissions"];
}) {
	const session = useRequiredSession();
	const hasAccess = useResourceGuard(AccessLevel.EDIT, initialLesson?.permissions);

	if (session.status === "loading") {
		return null;
	}

	if (!hasAccess) {
		return <UnauthorizedDialog onClose={() => onClose(undefined)} />;
	}

	return (
		<LessonEditor
			courseId={courseId}
			initialLesson={initialLesson}
			onClose={() => onClose(undefined)}
			onSubmit={onClose}
			isFullScreen={false}
			inheritedPermissions={inheritedPermissions}
		/>
	);
}

function UnauthorizedDialog({ onClose }: { onClose: () => void }) {
	const { t } = useTranslation("feature-teaching");

	return (
		<Dialog title={t("Not_Authorized")} onClose={onClose}>
			<p>{t("Lesson_Edit_Not_Allowed")}</p>
			<DialogActions abortLabel="Close" onClose={onClose} />
		</Dialog>
	);
}
