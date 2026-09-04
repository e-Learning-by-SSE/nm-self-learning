import { AccessLevel } from "@prisma/client";
import { LessonEditor, LessonFormModel } from "@self-learning/teaching";
import { OnDialogCloseFn } from "@self-learning/ui/common";
import { ResourceGuard } from "@self-learning/ui/layouts";

export function LessonEditorDialogWithGuard({
	onClose,
	initialLesson,
	courseId
}: {
	onClose: OnDialogCloseFn<LessonFormModel>;
	initialLesson?: LessonFormModel;
	courseId?: string;
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
			/>
		</ResourceGuard>
	);
}
