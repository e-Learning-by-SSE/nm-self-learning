import { SectionHeader } from "@self-learning/ui/common";
import { Form, LabeledField, MarkdownEditorDialog, Upload } from "@self-learning/ui/forms";
import { CenteredContainer } from "@self-learning/ui/layouts";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { CourseFormModel } from "./course-form-model";

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
export function CourseInfoForm() {
	const {
		register,
		control,
		setValue,
		formState: { errors }
	} = useFormContext<CourseFormModel & { content: unknown[] }>(); // widen content type to prevent circular path error

	const [openDescriptionEditor, setOpenDescriptionEditor] = useState(false);

	return (
		<CenteredContainer>
			<SectionHeader title="Daten" subtitle="Informationen über diesen Kurs." />

			<Form.SectionCard>
				<LabeledField label="Titel" error={errors.title?.message}>
					<input {...register("title")} placeholder="Der Neue Kurs" />
				</LabeledField>

				<div className="grid items-start gap-2 sm:flex">
					<LabeledField label="Slug" error={errors.slug?.message}>
						<input
							{...register("slug")}
							placeholder='Wird in der URL angezeigt, z. B.: "der-neue-kurs"'
						/>
					</LabeledField>

					<button className="btn-stroked h-fit self-end">Generieren</button>
				</div>

				<LabeledField label="Untertitel" error={errors.subtitle?.message}>
					<textarea
						{...register("subtitle")}
						placeholder="1-2 Sätze über diesen Kurs."
						className="h-full"
					/>
				</LabeledField>

				<div className="grid gap-8 md:grid-cols-[1fr_auto]">
					<LabeledField label="Beschreibung" optional={true}>
						<textarea
							{...register("description")}
							className="h-full"
							rows={5}
							placeholder="Beschreibung dieser Lernheit. Unterstützt Markdown."
						/>

						<button
							type="button"
							className="btn-stroked text-sm"
							onClick={() => setOpenDescriptionEditor(true)}
						>
							Markdown Editor öffnen
						</button>

						{openDescriptionEditor && (
							<Controller
								control={control}
								name="description"
								render={({ field }) => (
									<MarkdownEditorDialog
										title="Beschreibung"
										onClose={v => {
											if (v) {
												setValue("description", v);
											}
											setOpenDescriptionEditor(false);
										}}
										initialValue={field.value ?? ""}
									/>
								)}
							/>
						)}
					</LabeledField>

					<LabeledField label="Bild" error={errors.imgUrl?.message}>
						<Controller
							control={control}
							name="imgUrl"
							render={({ field }) => (
								<Upload
									mediaType="image"
									onUploadCompleted={field.onChange}
									preview={
										<div className="aspect-video rounded-lg">
											{field.value && (
												<img
													className="w-full rounded-lg object-contain"
													src={field.value}
													alt="Thumbnail"
												/>
											)}
										</div>
									}
								/>
							)}
						/>
					</LabeledField>
				</div>
			</Form.SectionCard>
		</CenteredContainer>
	);
}
