import { Dialog, DialogActions } from "@self-learning/ui/common";
import { LabeledField } from "@self-learning/ui/forms";
import { useState } from "react";
import { NewChapterDialogResult } from "../use-content-form";

export function NewChapterDialog({
	onClose
}: {
	onClose: (result?: NewChapterDialogResult) => void;
}) {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");

	return (
		<Dialog title="Kapitel hinzufügen" onClose={onClose}>
			<div className="flex flex-col gap-4">
				<LabeledField label="Titel">
					<input
						className="textfield"
						value={title}
						onChange={e => setTitle(e.target.value)}
						onKeyUp={e => {
							if (e.key === "Enter" && title.length > 0) {
								onClose({ title, description });
							}
						}}
					/>
				</LabeledField>

				<LabeledField label="Beschreibung" optional={true}>
					<textarea
						className="textfield"
						value={description}
						onChange={e => setDescription(e.target.value)}
						onKeyUp={e => {
							if (e.key === "Enter" && title.length > 0) {
								onClose({ title, description });
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
					onClick={() => onClose({ title, description })}
				>
					Hinzufügen
				</button>
			</DialogActions>
		</Dialog>
	);
}
