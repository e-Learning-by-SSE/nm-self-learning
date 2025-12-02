import { LicenseForm } from "@self-learning/teaching";
import {
	FieldHint,
	Form,
	InputWithButton,
	LabeledCheckbox,
	LabeledField,
	MarkdownField,
	useSlugify
} from "@self-learning/ui/forms";
import { Controller, useFormContext } from "react-hook-form";
import { AuthorsForm } from "../../author/authors-form";
import { LessonFormModel } from "../lesson-form-model";
import { SkillFormModel } from "@self-learning/types";
import { LessonSkillManagerDragDrop } from "./lesson-skill-manager-dragdrop";
import { GreyBoarderButton } from "@self-learning/ui/common";

export function ModuleInfoEditor({
	addSkills
}: {
	addSkills: (skillsToAdd: SkillFormModel[], field: "provides" | "requires") => void;
}) {
	const form = useFormContext<LessonFormModel>();
	const {
		register,
		control,
		formState: { errors }
	} = form;

	const { slugifyField, slugifyIfEmpty } = useSlugify(form, "title", "slug");

	return (
		<Form.SidebarSection>
			<div className="flex flex-col gap-4">
				<LabeledField label="Titel" error={errors.title?.message}>
					<input
						{...register("title")}
						type="text"
						className="textfield"
						placeholder="Die Neue Lerneinheit"
						onBlur={slugifyIfEmpty}
					/>
				</LabeledField>

				<LabeledField label="Slug" error={errors.slug?.message}>
					<InputWithButton
						input={
							<input
								className="textfield"
								placeholder="die-neue-lerneinheit"
								type={"text"}
								{...register("slug")}
							/>
						}
						button={
							<GreyBoarderButton
								type="button"
								onClick={slugifyField}
								title={"Generiere Slug"}
							>
								<span className={"text-gray-600"}>Generieren</span>
							</GreyBoarderButton>
						}
					/>
					<FieldHint>
						Der <strong>slug</strong> wird in der URL angezeigt. Muss einzigartig sein.
					</FieldHint>
				</LabeledField>

				<LabeledField
					label={"Beschreibung"}
					error={errors.description?.message}
					optional={true}
				>
					<Controller
						control={control}
						name={"description"}
						render={({ field }) => (
							<MarkdownField
								content={field.value as string}
								setValue={field.onChange}
								inline={true}
								placeholder={"1-2 Sätze welche diese Lerneinheit beschreibt."}
							/>
						)}
					></Controller>
				</LabeledField>

				<LabeledField
					label={"Selbstreguliertes Lernen"}
					error={errors.selfRegulatedQuestion?.message}
					optional={false}
				>
					<Controller
						control={control}
						name={"lessonType"}
						render={({ field }) => (
							<LabeledCheckbox
								label={"Aktivierungsfrage und sequenzielles Prüfen:"}
								checked={field.value === "SELF_REGULATED"}
								onChange={e => {
									field.onChange(
										e.target.checked ? "SELF_REGULATED" : "TRADITIONAL"
									);
								}}
							></LabeledCheckbox>
						)}
					></Controller>
				</LabeledField>

				<hr className="ml-3 flex flex-col gap-4 border-light-border py-4" />

				<AuthorsForm
					subtitle="Autoren dieser Lerneinheit."
					emptyString="Für diese Lerneinheit sind noch keine Autoren hinterlegt."
				/>

				<LicenseForm />

				<LessonSkillManagerDragDrop addSkills={addSkills} />
			</div>
		</Form.SidebarSection>
	);
}
