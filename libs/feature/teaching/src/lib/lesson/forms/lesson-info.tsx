import { SectionHeader } from "@self-learning/ui/common";
import { Form, LabeledField } from "@self-learning/ui/forms";
import { CenteredContainer } from "@self-learning/ui/layouts";
import { Controller, useFormContext } from "react-hook-form";
import { ImageUploadWidget } from "../../image-upload";
import { getSupabaseUrl } from "../../supabase";
import { LessonFormModel } from "../lesson-editor";

export function LessonInfoEditor() {
	const { register, control } = useFormContext<LessonFormModel>();

	return (
		<CenteredContainer>
			<SectionHeader title="Daten" subtitle="Informationen über diese Lerneinheit" />

			<Form.SectionCard>
				<LabeledField label="Titel">
					<input {...register("title")} placeholder="Die Neue Lerneinheit" />
				</LabeledField>

				<div className="grid items-start gap-2 sm:flex">
					<LabeledField label="Slug">
						<input
							{...register("slug")}
							placeholder='Wird in der URL angezeigt, z. B.: "die-neue-lerneinheit"'
						/>
					</LabeledField>

					<button className="btn-stroked h-fit self-end">Generieren</button>
				</div>

				<div className="grid gap-8 md:grid-cols-[1fr_auto]">
					<LabeledField label="Untertitel">
						<textarea
							{...register("subtitle")}
							placeholder="1-2 Sätze über diese Lerneinheit."
							className="h-full"
						/>
					</LabeledField>

					<LabeledField label="Bild">
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
