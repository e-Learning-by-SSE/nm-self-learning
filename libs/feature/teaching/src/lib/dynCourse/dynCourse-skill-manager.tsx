import { SkillFormModel } from "@self-learning/types";
import { useFormContext } from "react-hook-form";
import { DynCourseFormModel } from "../dynCourse/dynCourse-form-model";
import { SidebarSectionTitle } from "libs/ui/forms/src/lib/form-container";
import { LabeledFieldSelectSkillsView } from "../lesson/forms/lesson-skill-manager";

type SkillId = "requirements" | "teachingGoals";

export function DynCourseSkillManager() {
	const { watch, setValue } = useFormContext<DynCourseFormModel>();
	const watchingSkills = {
		teachingGoals: watch("teachingGoals"),
		requirements: watch("requirements")
	};

	const addSkills = (skill: SkillFormModel[] | undefined, id: SkillId) => {
		if (!skill) return;
		skill = skill.map(skill => ({ ...skill, children: [], parents: [] }));
		setValue(id, [...watchingSkills[id], ...skill]);
	};

	const deleteSkill = (skill: SkillFormModel, id: SkillId) => {
		setValue(
			id,
			watchingSkills[id].filter(s => s.id !== skill.id)
		);
	};

	return (
		<section className="mt-4">
			<SidebarSectionTitle
				title="Skills"
				subtitle="Vermittelte und benötigte Skills dieser Lerneinheit"
			/>
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
		</section>
	);
}
