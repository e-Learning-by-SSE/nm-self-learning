import { SkillFormModel } from "@self-learning/types";
import { SectionHeader } from "@self-learning/ui/common";
import { useFieldArray, useFormContext } from "react-hook-form";
import { LabeledFieldSelectSkillsView } from "../lesson/forms/lesson-skill-manager";
import { CourseFormModel } from "../course/course-form-model";

export function DynCourseContentForm() {
	const { control } = useFormContext<CourseFormModel>();

	const { fields, append, remove } = useFieldArray({
		control,
		name: "provides"
	});

	const addSkills = (skills: SkillFormModel[] | undefined) => {
		if (!skills || skills.length === 0) return;
		const formatted = skills.map(skill => ({
			...skill,
			children: [],
			parents: []
		}));
		append(formatted);
	};

	const deleteSkill = (index: number) => {
		remove(index);
	};

	return (
		<section>
			<SectionHeader title="Inhalt" subtitle="Der Inhalt des Kurses." />
			<div className="mb-4" />

			<LabeledFieldSelectSkillsView
				label={"Vermittelte Skills"}
				skills={fields}
				onDeleteSkill={(_, index) => {
					deleteSkill(index);
				}}
				onAddSkill={skill => {
					addSkills(skill);
				}}
			/>
		</section>
	);
}
