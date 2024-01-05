import { Dialog, DialogActions } from "@self-learning/ui/common";
import { LabeledField } from "@self-learning/ui/forms";
import { useState } from "react";

export function SkillSelectDialog({
	requiredSkill,
	gainedSkill,
	onClose
}: {
	requiredSkill?: string;
	gainedSkill?: string;
	onClose: (result?: any) => void;
}) {
	const [currentRequiredSkill, setRequiredSkill] = useState(requiredSkill ?? "");
	const [currentGainedSkill, setGainedSkill] = useState(gainedSkill ?? "");
	return (
		<Dialog title="Skill auswählen" onClose={onClose}>
			<div className="flex flex-col gap-1">
				<LabeledField label="Required skill">
					<input
						type="text"
						className="textfield"
						value={currentRequiredSkill}
						onChange={e => setRequiredSkill(e.target.value)}
					/>
				</LabeledField>
				<LabeledField label="Gained skill">
					<input
						type="text"
						className="textfield"
						value={currentGainedSkill}
						onChange={e => setGainedSkill(e.target.value)}
					/>
				</LabeledField>
				<DialogActions onClose={onClose}>
					<button
						type="button"
						className="btn-primary"
						onClick={() => onClose({ currentRequiredSkill, currentGainedSkill })}
					>
						Bestätigen
					</button>
				</DialogActions>
			</div>
			{/**
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
					onClick={() => onClose("wybrany skill")}
				>
					Bestätigen
				</button>
			</DialogActions>
			*/}
		</Dialog>
	);
}
