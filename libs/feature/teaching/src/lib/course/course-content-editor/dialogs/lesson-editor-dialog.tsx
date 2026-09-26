import { AccessLevel } from "@prisma/client";
import { LessonEditor, LessonFormModel } from "@self-learning/teaching";
import { OnDialogCloseFn } from "@self-learning/ui/common";
import { ResourceGuard } from "@self-learning/ui/layouts";

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
	return (
		<ResourceGuard
			fallback="unauthorized"
			requiredAccess={AccessLevel.EDIT}
			permittedGroups={initialLesson?.permissions}
		>
			<LessonEditor
				courseId={courseId}
				initialLesson={initialLesson}
				onClose={() => onClose(undefined)}
				onSubmit={onClose}
				isFullScreen={false}
				inheritedPermissions={inheritedPermissions}
			/>
		</ResourceGuard>
	);
}
