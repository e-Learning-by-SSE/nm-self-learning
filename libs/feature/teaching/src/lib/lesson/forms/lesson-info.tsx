import { SectionCard, SectionHeader } from "@self-learning/ui/common";
import { EditorField, LabeledField } from "@self-learning/ui/forms";
import { CenteredContainer } from "@self-learning/ui/layouts";
import { Controller, useFormContext } from "react-hook-form";
import { ImageUploadWidget } from "../../image-upload";
import { getSupabaseUrl } from "../../supabase";
import { LessonFormModel } from "../lesson-editor";

export function LessonInfoEditor() {
	const { register, getValues, setValue, control } = useFormContext<LessonFormModel>();

	return (
		<CenteredContainer>
			<SectionHeader title="Daten" subtitle="Informationen über diese Lerneinheit" />

			<SectionCard className="gap-8">
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

				<LabeledField label="Untertitel">
					<textarea
						{...register("subtitle")}
						placeholder="1-2 Sätze über diese Lerneinheit."
					/>
				</LabeledField>

				<Controller
					control={control}
					name="description"
					render={({ field }) => (
						<EditorField
							label="Beschreibung"
							value={field.value}
							onChange={field.onChange}
							language="markdown"
							height="128px"
						/>
					)}
				></Controller>

				<LabeledField label="Bild">
					<ImageUploadWidget
						url={getValues("imgUrl")}
						onUpload={filepath => {
							console.log(filepath);

							const { publicURL, error } = getSupabaseUrl("images", filepath);
							if (!error) {
								setValue("imgUrl", publicURL as string);
							}
						}}
						size={256}
					/>
				</LabeledField>
			</SectionCard>
		</CenteredContainer>
	);
}
