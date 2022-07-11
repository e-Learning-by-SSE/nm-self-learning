import { SectionHeader } from "@self-learning/ui/common";
import { Form, LabeledField } from "@self-learning/ui/forms";
import { CenteredContainer } from "@self-learning/ui/layouts";
import { useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { ImageUploadWidget } from "../image-upload";
import { MarkdownField } from "@self-learning/ui/forms";
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
		formState: { errors }
	} = useFormContext<CourseFormModel>();

	return (
		<Form.Container>
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

					<div className="grid gap-8 md:grid-cols-[1fr_auto]">
						<LabeledField label="Untertitel" error={errors.subtitle?.message}>
							<textarea
								{...register("subtitle")}
								placeholder="1-2 Sätze über diesen Kurs."
								className="h-full"
							/>
						</LabeledField>

						<LabeledField label="Bild">
							<Controller
								control={control}
								name="imgUrl"
								render={({ field }) => (
									<ImageUploadWidget
										width={256}
										height={256}
										url={field.value}
										onUpload={field.onChange}
									/>
								)}
							/>
						</LabeledField>
					</div>
				</Form.SectionCard>
			</CenteredContainer>

			<section>
				<CenteredContainer>
					<SectionHeader
						title="Beschreibung"
						subtitle="Ausführliche Beschreibung des Kurses. Unterstützt Markdown."
					/>
				</CenteredContainer>

				<Form.MarkdownWithPreviewContainer>
					<Controller
						control={control}
						name="description"
						render={({ field }) => (
							<MarkdownField
								content={field.value as string}
								setValue={field.onChange}
								minHeight="500px"
							/>
						)}
					/>
				</Form.MarkdownWithPreviewContainer>
			</section>
		</Form.Container>
	);
}
