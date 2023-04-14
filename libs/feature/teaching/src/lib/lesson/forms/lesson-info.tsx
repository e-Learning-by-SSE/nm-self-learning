import { LicenseForm } from "@self-learning/teaching";
import { ImageOrPlaceholder } from "@self-learning/ui/common";
import {
	FieldHint,
	Form,
	InputWithButton,
	LabeledField,
	Upload,
	useSlugify
} from "@self-learning/ui/forms";
import { Controller, useFormContext } from "react-hook-form";
import { AuthorsForm } from "../../author/authors-form";
import { LessonFormModel } from "../lesson-form-model";

export function LessonInfoEditor() {
	const form = useFormContext<LessonFormModel>();
	const {
		register,
		control,
		formState: { errors }
	} = form;

	const { slugifyField, slugifyIfEmpty } = useSlugify(form, "title", "slug");

	return (
		<Form.SidebarSection>
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
							<button type="button" className="btn-stroked" onClick={slugifyField}>
								Generieren
							</button>
						}
					/>
					<FieldHint>
						Der <strong>slug</strong> wird in der URL angezeigt. Muss einzigartig sein.
					</FieldHint>
				</LabeledField>

				<LabeledField label="Untertitel" error={errors.subtitle?.message}>
					<textarea
						{...register("subtitle")}
						placeholder="1-2 Sätze über diese Lerneinheit."
						rows={4}
					/>
				</LabeledField>

				<LabeledField label="Thumbnail" error={errors.imgUrl?.message}>
					<Controller
						control={control}
						name="imgUrl"
						render={({ field }) => (
							<Upload
								key={"image"}
								mediaType="image"
								onUploadCompleted={field.onChange}
								preview={
									<ImageOrPlaceholder
										src={field.value ?? undefined}
										className="aspect-video w-full rounded-lg object-cover"
									/>
								}
							/>
						)}
					/>
					<FieldHint>Thumbnails werden momentan nicht in der UI angezeigt.</FieldHint>
				</LabeledField>

				<AuthorsForm
					subtitle="Autoren dieser Lerneinheit."
					emptyString="Für diese Lerneinheit sind noch keine Autoren hinterlegt."
				/>

				<LicenseForm />
			</div>
		</Form.SidebarSection>
	);
}
