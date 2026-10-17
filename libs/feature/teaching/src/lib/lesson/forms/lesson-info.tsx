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
import { GroupAccessEditor } from "../../group/forms/group-form";
import { useTranslation } from "next-i18next";
// import { AiTutorConsent } from "./ai-tutor-consent";

export function LessonInfoEditor({ isNew }: { isNew: boolean }) {
	const { t } = useTranslation(["feature-teaching", "common"]);
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
				<Form.SidebarSectionTitle
					title={t("common:Information")}
					subtitle={t("Lesson_Info_Section_Subtitle")}
				/>
				<div className="flex flex-col gap-4">
					<LabeledField label={t("common:Title")} error={errors.title?.message}>
						<input
							{...register("title")}
							type="text"
							className="textfield"
							placeholder={t("Lesson_Title_Placeholder")}
							onBlur={slugifyIfEmpty}
						/>
					</LabeledField>

					<LabeledField label={t("common:Slug")} error={errors.slug?.message}>
						<InputWithButton
							input={
								<input
									className="textfield"
									placeholder={t("Lesson_Slug_Placeholder")}
									type={"text"}
									{...register("slug")}
								/>
							}
							button={
								<button
									className="btn btn-tertiary"
									type="button"
									onClick={slugifyField}
									title={t("Lesson_Generate_Slug")}
								>
									<span className={"text-gray-600"}>{t("common:Generate")}</span>
								</button>
							}
						/>
						<FieldHint>{t("common:Slug Description")}</FieldHint>
					</LabeledField>

					<LabeledField
						label={t("common:Subtitle")}
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
									placeholder={t("Lesson_Subtitle_Placeholder")}
								/>
							)}
						></Controller>
					</LabeledField>
					<LabeledField
						label={t("common:Description")}
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
									placeholder={t("Lesson_Description_Placeholder")}
								></MarkdownField>
							)}
						></Controller>
					</LabeledField>

					<LabeledField
						label={t("Lesson_Self_Regulated_Label")}
						error={errors.selfRegulatedQuestion?.message}
						optional={false}
					>
						<Controller
							control={control}
							name={"lessonType"}
							render={({ field }) => (
								<LabeledCheckbox
									label={t("Lesson_Self_Regulated_Checkbox")}
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
			<GroupAccessEditor subtitle={t("Lesson_Group_Access_Subtitle")} isNew={isNew} />
			<AuthorsForm
				subtitle={t("Lesson_Authors_Subtitle")}
				emptyString={t("Lesson_Authors_Empty")}
			/>
			{/* <AiTutorConsent /> */}
			<LicenseForm />
		</>
	);
}
