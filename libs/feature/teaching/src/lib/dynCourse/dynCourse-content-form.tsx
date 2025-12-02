import { SkillFormModel } from "@self-learning/types";
import { SectionHeader } from "@self-learning/ui/common";
import { useFormContext } from "react-hook-form";
import { DynCourseFormModel } from "./dynCourse-form-model";
import { LabeledFieldSelectSkillsView } from "../lesson/forms/lesson-skill-manager";

export function DynCourseContentForm() {
	const { watch, setValue } = useFormContext<DynCourseFormModel>();
	const watchingSkills = {
		teachingGoals: watch("teachingGoals")
	};

	const addSkills = (skill: SkillFormModel[] | undefined) => {
		if (!skill) return;
		skill = skill.map(skill => ({ ...skill, children: [], parents: [] }));
		setValue("teachingGoals", [...watchingSkills["teachingGoals"], ...skill]);
	};

	const deleteSkill = (skill: SkillFormModel) => {
		setValue(
			"teachingGoals",
			watchingSkills["teachingGoals"].filter(s => s.id !== skill.id)
		);
	};

	return (
		<section>
			<SectionHeader title="Inhalt" subtitle="Der Inhalt des Kurses." />
			<div className="mb-4" />

			<LabeledFieldSelectSkillsView
				label={"Vermittelte Skills"}
				skills={watchingSkills["teachingGoals"]}
				onDeleteSkill={skill => {
					deleteSkill(skill);
				}}
				onAddSkill={skill => {
					addSkills(skill);
				}}
			/>
		</section>
	);
}
