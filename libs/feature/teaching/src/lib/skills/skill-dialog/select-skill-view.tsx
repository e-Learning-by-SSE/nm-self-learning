import { IconButton } from "@self-learning/ui/common";
import { SelectSkillDialog } from "./select-skill-dialog";
import { useState } from "react";
import { SkillFormModel } from "@self-learning/types";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";

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
	const [selectSkillModal, setSelectSkillModal] = useState<boolean>(false);

	return (
		<div className="flex flex-col">
			<IconButton
				type="button"
				data-testid="BenoetigteSkills-add"
				onClick={() => setSelectSkillModal(true)}
				title="Hinzufügen"
				text="Hinzufügen"
				icon={<PlusIcon className="h-5" />}
			/>
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
					skillsResolved={false}
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
				<button
					type="button"
					data-testid="remove"
					className="mr-2 rounded-full p-2 hover:bg-gray-50 hover:text-red-500"
					onClick={onRemove}
				>
					<XMarkIcon className="h-3" />
				</button>
			</div>
		</div>
	);
}
