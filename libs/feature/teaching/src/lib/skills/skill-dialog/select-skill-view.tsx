import { PlusIcon } from "@heroicons/react/24/solid";
import { SkillFormModel } from "@self-learning/types";
import { getButtonSizeClass, IconButton, XButton } from "@self-learning/ui/common";
import { LabeledField } from "@self-learning/ui/forms";
import { useState } from "react";
import { SelectSkillDialog } from "./select-skill-dialog";

export function LabeledFieldSelectSkillsView({
	skills,
	onDeleteSkill,
	onAddSkill,
	repoId,
	label
}: {
	skills: SkillFormModel[];
	onDeleteSkill: (skill: SkillFormModel) => void;
	onAddSkill: (skill: SkillFormModel[] | undefined) => void;
	repoId: string;
	label: string;
}) {
	const [selectSkillModal, setSelectSkillModal] = useState<boolean>(false);

	return (
		<LabeledField label={label} button={null}>
			<button
				type="button"
				onClick={() => setSelectSkillModal(true)}
				className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-400 rounded py-2 mb-3 text-grey-500 hover:bg-emerald-50 transition text-sm"
				data-testid="BenoetigteSkills-add"
				onDragOver={e => e.preventDefault()}
				onDrop={handleDropSkill(onAddSkill)}
			>
				Klicken zum Auswhählen oder mit Drag & Drop einfügen
			</button>
			<SkillManagementComponent
				skills={skills}
				setSelectSkillModal={setSelectSkillModal}
				onAddSkill={onAddSkill}
				selectSkillModal={selectSkillModal}
				onDeleteSkill={onDeleteSkill}
				repoId={repoId}
			/>
		</LabeledField>
	);
}

function handleDropSkill(
	onAddSkill: (skill: SkillFormModel[] | undefined) => void
) {
	return (event: React.DragEvent<HTMLButtonElement>) => {
		event.preventDefault();
		const data = event.dataTransfer.getData("text/plain");
		if (!data) return;

		try {
			const skill: SkillFormModel = JSON.parse(data);
			onAddSkill([skill]);
		} catch (error) {
			console.error("Invalid skill data", error);
		}
	};
}

// TODO looks like a duplicate of the above component
export function SelectSkillsView({
	skills,
	onDeleteSkill,
	onAddSkill,
	repoId
}: {
	skills: SkillFormModel[];
	onDeleteSkill: (skill: SkillFormModel) => void;
	onAddSkill: (skill: SkillFormModel[] | undefined) => void;
	repoId: string;
}) {
	const [selectSkillModal, setSelectSkillModal] = useState(false);

	return (
		<>
			<IconButton
				text="Hinzufügen"
				icon={<PlusIcon className={getButtonSizeClass("medium")} />}
				onClick={() => setSelectSkillModal(true)}
				title={"Hinzufügen"}
				data-testid="BenoetigteSkills-add"
			/>
			<SkillManagementComponent
				skills={skills}
				setSelectSkillModal={setSelectSkillModal}
				onAddSkill={onAddSkill}
				selectSkillModal={selectSkillModal}
				onDeleteSkill={onDeleteSkill}
				repoId={repoId}
			/>
		</>
	);
}

function SkillManagementComponent({
	skills,
	onDeleteSkill,
	onAddSkill,
	repoId,
	setSelectSkillModal,
	selectSkillModal
}: {
	skills: SkillFormModel[];
	onDeleteSkill: (skill: SkillFormModel) => void;
	onAddSkill: (skill: SkillFormModel[] | undefined) => void;
	repoId: string;
	setSelectSkillModal: (value: boolean | ((prevVar: boolean) => boolean)) => void;
	selectSkillModal: boolean;
}) {
	return (
		<div className="flex flex-col">
			{skills.length === 0 && (
				<div className="mt-3 text-sm text-gray-500">Keine Skills vorhanden</div>
			)}
			<div className="mt-3 max-h-40 overflow-auto">
				{skills.map((skill, index) => (
					<InlineRemoveButton
						key={index}
						label={skill.name}
						onRemove={() => onDeleteSkill(skill)}
						onClick={() => {}} //TODO
					/>
				))}
			</div>
			{selectSkillModal && (
				<SelectSkillDialog
					onClose={skill => {
						setSelectSkillModal(false);
						onAddSkill(skill);
					}}
					repositoryId={repoId}
				/>
			)}
		</div>
	);
}

function InlineRemoveButton({
	label,
	onRemove,
	onClick
}: {
	label: string;
	onRemove: () => void;
	onClick: () => void;
}) {
	return (
		<div className="inline-block">
			<div className="flex items-center rounded-lg border border-light-border bg-white text-sm">
				<button
					className="flex flex-grow cursor-pointer flex-col px-4 hover:text-secondary"
					onClick={onClick}
					type="button"
				>
					{label}
				</button>
				<XButton onClick={onRemove} title={"Skill entfernen"} className="p-2 mr-2" />
			</div>
		</div>
	);
}
