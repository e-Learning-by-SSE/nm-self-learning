import { Dialog, DialogActions, OnDialogCloseFn } from "@self-learning/ui/common";
import { LessonFormModel } from "@self-learning/teaching";
import React from "react";

export function NoPermissionToEditComponent({
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
