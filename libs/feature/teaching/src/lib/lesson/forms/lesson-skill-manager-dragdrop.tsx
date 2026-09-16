import { SkillFormModel } from "@self-learning/types";
import { Form } from "@self-learning/ui/forms";
import { useFormContext } from "react-hook-form";
import { LessonFormModel } from "../lesson-form-model";
import { LabeledFieldSelectSkillsViewDragDrop } from "../../skills/skill-dialog/select-skill-view";
import { useTranslation } from "react-i18next";

/**
 * Drag and Drop area to add and remove skills to a lesson
 */
export function LessonSkillManagerDragDrop({
	addSkills = () => {},
	removeSkill = () => {},
	excludeIds,
	catalog,
	target
}: {
	addSkills?: (skillsToAdd: SkillFormModel[], field: "provides" | "requires") => void;
	removeSkill?: (skill: SkillFormModel, field: "provides" | "requires") => void;
	excludeIds?: ReadonlySet<string>;
	catalog?: SkillFormModel[];
	target?: "lesson" | "staticCourse" | "dynamicCourse";
}) {
	const { watch } = useFormContext<LessonFormModel>();

	const { t } = useTranslation("feature-teaching");

	const watchingSkills = {
		requires: watch("requires"),
		provides: watch("provides")
	};

	const subtitle =
		target === "dynamicCourse"
			? t("Skills_Subtitle_Dynamic_Course")
			: target === "staticCourse"
				? t("Skills_Subtitle_Static_Course")
				: t("Skills_Subtitle_Lesson");

	return (
		<Form.SidebarSection>
			<Form.SidebarSectionTitle title={t("Skills_Title")} subtitle={subtitle} />

			<>
				<LabeledFieldSelectSkillsViewDragDrop
					label={t("Skills_Provides")}
					skills={watchingSkills["provides"]}
					onDeleteSkill={skill => {
						removeSkill(skill, "provides");
					}}
					onAddSkill={skill => {
						if (skill) addSkills(skill, "provides");
					}}
					droppableId="provides"
					excludeIds={excludeIds}
					catalog={catalog}
				/>

				<LabeledFieldSelectSkillsViewDragDrop
					label={t("Skills_Requires")}
					skills={watchingSkills["requires"]}
					onDeleteSkill={skill => {
						removeSkill(skill, "requires");
					}}
					onAddSkill={skill => {
						if (skill) addSkills(skill, "requires");
					}}
					droppableId="requires"
					excludeIds={excludeIds}
					catalog={catalog}
				/>
			</>
		</Form.SidebarSection>
	);
}
