import { SectionHeader } from "@self-learning/ui/common";
import { Form, LabeledField, Upload } from "@self-learning/ui/forms";
import { CenteredContainer } from "@self-learning/ui/layouts";
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
		formState: { errors }
	} = useFormContext<CourseFormModel & { content: unknown[] }>(); // widen content type to prevent circular path error

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

				<LabeledField label="Bild" error={errors.imgUrl?.message}>
					<Controller
						control={control}
						name="imgUrl"
						render={({ field }) => (
							<Upload
								mediaType="image"
								onUploadCompleted={field.onChange}
								preview={
									<div className="aspect-video h-64 rounded-lg">
										{field.value && (
											<img
												className="aspect-video h-64 rounded-lg object-cover"
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
			</Form.SectionCard>
		</CenteredContainer>
	);
}
