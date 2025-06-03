import { SkillFormModel, SkillRepositoryModel } from "@self-learning/types";
import { SectionHeader } from "@self-learning/ui/common";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { LinkedSkillRepositoryMemorized } from "../lesson/forms/lesson-skill-manager";
import { LabeledFieldSelectSkillsView } from "../skills/skill-dialog/select-skill-view";
import { NewCourseFormModel } from "./newCourse-form-model";

export function NewCourseContentForm() {
	const { watch, setValue } = useFormContext<NewCourseFormModel>();
	const [selectedRepository, setSelectedRepository] = useState<SkillRepositoryModel | null>(null);
	const watchingSkills = {
		teachingGoals: watch("teachingGoals")
	};

	const selectRepository = (id: SkillRepositoryModel) => {
		setSelectedRepository(id);
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
			<LinkedSkillRepositoryMemorized selectRepository={selectRepository} />
			<div className="mb-4" />
			{selectedRepository && (
				<LabeledFieldSelectSkillsView
					label={"Vermittelte Skills"}
					skills={watchingSkills["teachingGoals"]}
					onDeleteSkill={skill => {
						deleteSkill(skill);
					}}
					onAddSkill={skill => {
						addSkills(skill);
					}}
					repoId={selectedRepository.id}
				/>
			)}
		</section>
	);
}
