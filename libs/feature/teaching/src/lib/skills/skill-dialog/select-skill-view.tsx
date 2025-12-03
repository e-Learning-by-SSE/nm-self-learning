import { PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { SkillFormModel } from "@self-learning/types";
import { IconTextButton, IconOnlyButton } from "@self-learning/ui/common";
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
		<LabeledField
			label={label}
			button={
				<IconTextButton
					text="Hinzufügen"
					icon={<PlusIcon className="h-5 w-5" />}
					className="btn-secondary"
					onClick={() => setSelectSkillModal(true)}
					title={"Hinzufügen"}
					data-testid="BenoetigteSkills-add"
				/>
			}
		>
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
			<IconTextButton
				text="Hinzufügen"
				icon={<PlusIcon className="h-5 w-5" />}
				className="btn-secondary"
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
				<div className="mt-3 text-sm text-c-text-muted">Keine Skills vorhanden</div>
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
			<div className="flex items-center rounded-lg border border-c-border bg-white text-sm">
				<button
					className="flex flex-grow cursor-pointer flex-col px-4 hover:text-c-primary"
					onClick={onClick}
					type="button"
				>
					{label}
				</button>
				<IconOnlyButton
					onClick={onRemove}
					title={"Skill entfernen"}
					icon={<XMarkIcon className="h-5 w-5" />}
					variant="x-mark"
					className="p-2 mr-2"
				/>
			</div>
		</div>
	);
}
