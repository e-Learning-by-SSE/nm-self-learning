/* eslint-disable react/jsx-no-useless-fragment */
import { SkillFormModel } from "@self-learning/types";
import { Form, LabeledField } from "@self-learning/ui/forms";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { LessonFormModel } from "../lesson-form-model";
import { PlusIcon } from "@heroicons/react/24/solid";
import { getButtonSizeClass, IconButton } from "@self-learning/ui/common";
import { SelectSkillDialog } from "../../skills/skill-dialog/select-skill-dialog";
import { SkillManagementComponent } from "../../skills/skill-dialog/select-skill-view";

type SkillModalIdentifier = "provides" | "requires";

/**
 * Area to add and remove skills to a lesson
 */
export function LessonSkillManager() {
	const { setValue, watch } = useFormContext<LessonFormModel>();

	const watchingSkills = {
		requires: watch("requires"),
		provides: watch("provides")
	};

	const [selectSkillModal, setSelectSkillModal] = useState<{ id: SkillModalIdentifier } | null>(
		null
	);

	const addSkills = (skill: SkillFormModel[] | undefined, id: SkillModalIdentifier) => {
		if (!skill) return;
		skill = skill.map(skill => ({ ...skill, children: [], parents: [] }));
		setValue(id, [...watchingSkills[id], ...skill]);
	};

	const deleteSkill = (skill: SkillFormModel, id: SkillModalIdentifier) => {
		setValue(
			id,
			watchingSkills[id].filter(s => s.id !== skill.id)
		);
	};

	return (
		<Form.SidebarSection>
			<Form.SidebarSectionTitle
				title="Skills"
				subtitle="Vermittelte und Benötigte Skills dieser Lerneinheit"
			/>
			<>
				<LabeledFieldSelectSkillsView2
					label={"Vermittelte Skills"}
					skills={watchingSkills["provides"]}
					onDeleteSkill={skill => {
						deleteSkill(skill, "provides");
					}}
					onAddSkill={skill => {
						addSkills(skill, "provides");
					}}
				/>

				<LabeledFieldSelectSkillsView2
					label={"Benötigte Skills"}
					skills={watchingSkills["requires"]}
					onDeleteSkill={skill => {
						deleteSkill(skill, "requires");
					}}
					onAddSkill={skill => {
						addSkills(skill, "requires");
					}}
				/>
				{selectSkillModal && (
					<SelectSkillDialog
						onClose={skill => {
							setSelectSkillModal(null);
							addSkills(skill, selectSkillModal.id);
						}}
					/>
				)}
			</>
		</Form.SidebarSection>
	);
}

export function LabeledFieldSelectSkillsView2({
	skills,
	onDeleteSkill,
	onAddSkill,
	label
}: {
	skills: SkillFormModel[];
	onDeleteSkill: (skill: SkillFormModel) => void;
	onAddSkill: (skill: SkillFormModel[] | undefined) => void;
	label: string;
}) {
	const [selectSkillModal, setSelectSkillModal] = useState<boolean>(false);

	return (
		<LabeledField
			label={label}
			button={
				<IconButton
					text="Hinzufügen"
					icon={<PlusIcon className={getButtonSizeClass("medium")} />}
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
			/>
		</LabeledField>
	);
}
