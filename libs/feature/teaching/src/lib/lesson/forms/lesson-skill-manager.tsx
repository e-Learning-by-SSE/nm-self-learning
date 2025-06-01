/* eslint-disable react/jsx-no-useless-fragment */
import { SkillFormModel } from "@self-learning/types";
import { Form} from "@self-learning/ui/forms";
import { useEffect, useState } from "react";
import { SelectSkillDialog } from "../../skills/skill-dialog/select-skill-dialog";
import { useFormContext } from "react-hook-form";
import { LessonFormModel } from "../lesson-form-model";
import { LabeledFieldSelectSkillsView } from "../../skills/skill-dialog/select-skill-view";

type SkillModalIdentifier = "teachingGoals" | "requirements";

/**
 * Area to add and remove skills to a lesson
 */
export function LessonSkillManager() {
	const { setValue, watch } = useFormContext<LessonFormModel>();

	const watchingSkills = {
		requirements: watch("requirements"),
		teachingGoals: watch("teachingGoals")
	};

	const [selectSkillModal, setSelectSkillModal] = useState<{
		id: SkillModalIdentifier;
	} | null>(null);

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
				<LabeledFieldSelectSkillsView
					label={"Vermittelte Skills"}
					skills={watchingSkills["teachingGoals"]}
					onDeleteSkill={skill => {
						deleteSkill(skill, "teachingGoals");
					}}
					onAddSkill={skill => {
						addSkills(skill, "teachingGoals");
					}}
				/>

				<LabeledFieldSelectSkillsView
					label={"Benötigte Skills"}
					skills={watchingSkills["requirements"]}
					onDeleteSkill={skill => {
						deleteSkill(skill, "requirements");
					}}
					onAddSkill={skill => {
						addSkills(skill, "requirements");
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
