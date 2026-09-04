import { ImageOrPlaceholder } from "@self-learning/ui/common";
import {
	Form,
	InputWithButton,
	LabeledField,
	MarkdownField,
	Upload,
	useSlugify
} from "@self-learning/ui/forms";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { CourseFormModel } from "./course-form-model";
import { useTranslation } from "next-i18next";
import { useResourceGuard } from "@self-learning/ui/layouts";
import { AccessLevel, CourseType } from "@prisma/client";
import { GroupAccessEditor } from "../group/forms/group-form";
import { AuthorsForm } from "../author/authors-form";

/**
 * Allows the user to edit basic information about a course,
 * such as the `title`, `slug`, `subtitle`, `description`.
 *
 * Must be wrapped in a provider that provides the form context.
 *
 * @example
 *	const methods = useForm<CourseFormModel>({
 *		defaultValues: { ...course }
 *	});
 *
 * return (
 * 	<FormProvider {...methods}>
 * 		<CourseInfoForm />
 * 	</FormProvider>
 * )
 */
export function CourseInfoForm({ isNew }: { isNew: boolean }) {
	const form = useFormContext<CourseFormModel & { content: unknown[] }>();
	// widen content type to prevent circular path error
	const {
		register,
		control,
		formState: { errors }
	} = form;
	const { slugifyField, slugifyIfEmpty } = useSlugify(form, "title", "slug");
	const { t } = useTranslation("pages-course-info");
	const permissions = useWatch({ control: form.control, name: "permissions" }) ?? [];
	const hasFull = useResourceGuard(AccessLevel.FULL, permissions);
	const showGroupAccessEditor = isNew || hasFull;

	return (
		<>
			<Form.SidebarSection>
				<Form.SidebarSectionTitle
					title="Daten"
					subtitle="Informationen über diesen Kurs."
				/>

				<div className="flex flex-col gap-4">
					<LabeledField label="Titel" error={errors.title?.message}>
						<input
							{...register("title")}
							type="text"
							className="textfield"
							placeholder={t("The new course")}
							onBlur={slugifyIfEmpty}
						/>
					</LabeledField>
					<LabeledField label="Slug" error={errors.slug?.message}>
						<InputWithButton
							input={
								<input
									className="textfield"
									placeholder={t("the-new-course")}
									type={"text"}
									{...register("slug")}
								/>
							}
							button={
								<button
									type="button"
									className="btn-stroked"
									onClick={slugifyField}
								>
									Generieren
								</button>
							}
						/>
					</LabeledField>

					<LabeledField label="Kurstyp" error={errors.type?.message}>
						<div className="flex gap-4">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									value={CourseType.STATIC}
									disabled={!isNew}
									{...register("type")}
								/>
								Statisch
							</label>
							<label className="flex items-center gap-2">
								<input
									type="radio"
									value={CourseType.DYNAMIC}
									disabled={!isNew}
									{...register("type")}
								/>
								Dynamisch
							</label>
						</div>
					</LabeledField>

					<LabeledField label="Untertitel" error={errors.subtitle?.message}>
						<textarea
							{...register("subtitle")}
							placeholder="1-2 Sätze über diesen Kurs."
							className="h-full"
						/>
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
									placeholder={"1-2 Sätze welche diesen Kurs beschreibt."}
								></MarkdownField>
							)}
						></Controller>
					</LabeledField>

					<LabeledField label="Bild" error={errors.imgUrl?.message} optional={true}>
						<Controller
							control={control}
							name="imgUrl"
							render={({ field }) => (
								<Upload
									mediaType="image"
									onUploadCompleted={field.onChange}
									preview={
										<ImageOrPlaceholder
											src={field.value ?? undefined}
											className="aspect-video w-full rounded-lg object-cover max-w-64"
										/>
									}
								/>
							)}
						/>
					</LabeledField>
				</div>
			</Form.SidebarSection>
			{showGroupAccessEditor && (
				<GroupAccessEditor
					subtitle="Gruppen, die auf diesen Kurs zugreifen können"
					doUseDefaultGroup={isNew}
				/>
			)}
			<AuthorsForm
				subtitle="Die Autoren dieses Kurses."
				emptyString="Für diesen Kurs sind noch keine Autoren hinterlegt."
			/>
		</>
	);
}
