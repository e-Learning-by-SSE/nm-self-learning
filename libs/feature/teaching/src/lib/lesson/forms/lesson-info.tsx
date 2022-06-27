import { SectionHeader } from "@self-learning/ui/common";
import { Form, LabeledField } from "@self-learning/ui/forms";
import { CenteredContainer } from "@self-learning/ui/layouts";
import { Controller, useFormContext } from "react-hook-form";
import slugify from "slugify";
import { ImageUploadWidget } from "../../image-upload";
import { getSupabaseUrl } from "../../supabase";
import { LessonFormModel } from "../lesson-form-model";

export function LessonInfoEditor() {
	const {
		getValues,
		setValue,
		register,
		control,
		formState: { errors }
	} = useFormContext<LessonFormModel>();

	function slugifyTitle() {
		const title = getValues("title");
		const slug = slugify(title, { lower: true });
		setValue("slug", slug);
	}

	return (
		<CenteredContainer>
			<SectionHeader title="Daten" subtitle="Informationen über diese Lerneinheit" />

			<Form.SectionCard>
				<LabeledField label="Titel" error={errors.title?.message}>
					<input
						{...register("title")}
						placeholder="Die Neue Lerneinheit"
						onBlur={() => {
							if (getValues("slug") === "") {
								slugifyTitle();
							}
						}}
					/>
				</LabeledField>

				<div className="grid items-start gap-2 sm:flex">
					<LabeledField label="Slug" error={errors.slug?.message}>
						<input
							{...register("slug")}
							placeholder='Wird in der URL angezeigt, z. B.: "die-neue-lerneinheit"'
						/>
					</LabeledField>

					<button className="btn-stroked h-fit self-end" onClick={slugifyTitle}>
						Generieren
					</button>
				</div>

				<div className="grid gap-8 md:grid-cols-[1fr_auto]">
					<LabeledField label="Untertitel" error={errors.subtitle?.message}>
						<textarea
							{...register("subtitle")}
							placeholder="1-2 Sätze über diese Lerneinheit."
							className="h-full"
						/>
					</LabeledField>

					<LabeledField label="Bild" error={errors.imgUrl?.message}>
						<Controller
							control={control}
							name="imgUrl"
							render={({ field }) => (
								<ImageUploadWidget
									url={field.value}
									onUpload={filepath => {
										console.log(filepath);

										const { publicURL, error } = getSupabaseUrl(
											"images",
											filepath
										);
										if (!error) {
											field.onChange(publicURL);
										}
									}}
									width={256}
									height={256}
								/>
							)}
						/>
					</LabeledField>
				</div>
			</Form.SectionCard>
		</CenteredContainer>
	);
}
