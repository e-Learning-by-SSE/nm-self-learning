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
import { LessonSkillManager } from "./lesson-skill-manager";
import { GroupAccessEditor } from "../../group/forms/group-form";

export function LessonInfoEditor() {
	const form = useFormContext<LessonFormModel>();
	const {
		register,
		control,
		formState: { errors }
	} = form;

	const { slugifyField, slugifyIfEmpty } = useSlugify(form, "title", "slug");

	return (
		<>
			<Form.SidebarSection>
				<button
					className="btn btn-tertiary"
					type="button"
					onClick={() => console.log(form.getValues())}
				>
					Hallo
				</button>
				<Form.SidebarSectionTitle
					title="Daten"
					subtitle="Informationen über diese Lerneinheit"
				/>
				<div className="flex flex-col gap-4">
					<LabeledField label="Titel" error={errors.title?.message}>
						<input
							{...register("title")}
							type="text"
							className="textfield"
							placeholder="Die neue Lerneinheit"
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
								<button
									className="btn btn-tertiary"
									type="button"
									onClick={slugifyField}
									title={"Slug generieren"}
								>
									<span className={"text-gray-600"}>Generieren</span>
								</button>
							}
						/>
						<FieldHint>
							Der <strong>slug</strong> wird in der URL angezeigt. Muss einzigartig
							sein.
						</FieldHint>
					</LabeledField>

					<LabeledField
						label="Untertitel"
						error={errors.subtitle?.message}
						optional={true}
					>
						<Controller
							control={control}
							name="subtitle"
							render={({ field }) => (
								<MarkdownField
									content={field.value as string}
									setValue={field.onChange}
									inline={true}
									placeholder="1-2 Sätze über diese Lerneinheit."
								/>
							)}
						></Controller>
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
								></MarkdownField>
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
				</div>
			</Form.SidebarSection>
			<GroupAccessEditor subtitle="Gruppen, die auf diese Lerninhalt zugreifen können" />
			<AuthorsForm
				subtitle="Autoren dieser Lerneinheit."
				emptyString="Für diese Lerneinheit sind noch keine Autoren hinterlegt."
			/>
			<LicenseForm />
			<LessonSkillManager />
		</>
	);
}
