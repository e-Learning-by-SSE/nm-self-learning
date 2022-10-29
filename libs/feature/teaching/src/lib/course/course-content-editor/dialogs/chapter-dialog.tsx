import { CourseChapter } from "@self-learning/types";
import { Dialog, DialogActions } from "@self-learning/ui/common";
import { LabeledField } from "@self-learning/ui/forms";
import { useState } from "react";

export function ChapterDialog({
	onClose,
	chapter
}: {
	chapter?: CourseChapter;
	onClose: (result?: CourseChapter) => void;
}) {
	const [title, setTitle] = useState(chapter?.title ?? "");
	const [description, setDescription] = useState(chapter?.description ?? "");
	const [content] = useState(chapter?.content ?? []);

	return (
		<Dialog title="Kapitel hinzufügen" onClose={onClose}>
			<div className="flex flex-col gap-4">
				<LabeledField label="Titel">
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

				<LabeledField label="Beschreibung" optional={true}>
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
					Bestätigen
				</button>
			</DialogActions>
		</Dialog>
	);
}
