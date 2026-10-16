import { CourseChapter } from "@self-learning/types";
import { Dialog, DialogActions } from "@self-learning/ui/common";
import { LabeledField } from "@self-learning/ui/forms";
import { useState } from "react";
import { useTranslation } from "next-i18next";

export function ChapterDialog({
	onClose,
	chapter
}: {
	chapter?: CourseChapter;
	onClose: (result?: CourseChapter) => void;
}) {
	const { t } = useTranslation("feature-teaching");
	const [title, setTitle] = useState(chapter?.title ?? "");
	const [description, setDescription] = useState(chapter?.description ?? "");
	const [content] = useState(chapter?.content ?? []);

	return (
		<Dialog
			title={t(chapter ? "Course_Content_Edit_Chapter_Title" : "Course_Content_Create_Chapter")}
			onClose={onClose}
		>
			<div className="flex flex-col gap-4">
				<LabeledField label={t("common:Title")}>
					<input
						type="text"
						className="textfield"
						value={title}
						onChange={e => setTitle(e.target.value)}
						onKeyUp={e => {
							if (e.key === "Enter" && title.length > 0) {
								onClose({ title, description, content });
							}
						}}
					/>
				</LabeledField>

				<LabeledField label={t("common:Description")} optional={true}>
					<textarea
						className="textfield"
						rows={5}
						value={description}
						onChange={e => setDescription(e.target.value)}
						onKeyUp={e => {
							if (e.key === "Enter" && title.length > 0) {
								onClose({ title, description, content });
							}
						}}
					/>
				</LabeledField>
			</div>

			<DialogActions onClose={onClose}>
				<button
					type="button"
					className="btn-primary"
					disabled={title.length === 0}
					onClick={() => onClose({ title, description, content })}
				>
					{t(chapter ? "common:save" : "common:create")}
				</button>
			</DialogActions>
		</Dialog>
	);
}
