import { SkillFormModel } from "@self-learning/types";
import { useFieldArray, useFormContext } from "react-hook-form";
import { SidebarSectionTitle } from "libs/ui/forms/src/lib/form-container";
import { LabeledFieldSelectSkillsView } from "../lesson/forms/lesson-skill-manager";
import { CourseFormModel } from "../course/course-form-model";

export function DynCourseSkillManager() {
	const { control } = useFormContext<CourseFormModel>();

	const {
		fields: required,
		append: appendRequired,
		remove: removeRequired
	} = useFieldArray({
		control,
		name: "requires"
	});

	const addRequired = (skills: SkillFormModel[] | undefined) => {
		if (!skills || skills.length === 0) return;
		const formatted = skills.map(skill => ({
			...skill,
			children: [],
			parents: []
		}));
		appendRequired(formatted);
	};

	const {
		fields: provided,
		append: appendProvided,
		remove: removeProvided
	} = useFieldArray({
		control,
		name: "provides"
	});

	const addProvided = (skills: SkillFormModel[] | undefined) => {
		if (!skills || skills.length === 0) return;
		const formatted = skills.map(skill => ({
			...skill,
			children: [],
			parents: []
		}));
		appendProvided(formatted);
	};

	return (
		<section className="mt-4">
			<SidebarSectionTitle
				title="Skills"
				subtitle="Vermittelte und benötigte Skills dieser Lerneinheit"
			/>
			<LabeledFieldSelectSkillsView
				label={"Vermittelte Skills"}
				skills={provided}
				onDeleteSkill={(_, id) => removeProvided(id)}
				onAddSkill={addProvided}
			/>
			<LabeledFieldSelectSkillsView
				label={"Benötigte Skills"}
				skills={required}
				onDeleteSkill={(_, id) => removeRequired(id)}
				onAddSkill={addRequired}
			/>
		</section>
	);
}
