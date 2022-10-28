import { Form, LabeledField, Upload } from "@self-learning/ui/forms";
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
		<Form.SidebarSection>
			<Form.SidebarSectionTitle title="Daten" subtitle="Informationen über diesen Kurs." />

			<div className="flex flex-col gap-4">
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
									<div className="aspect-video w-full rounded-lg">
										{field.value && (
											<img
												className="aspect-video w-full rounded-lg object-cover"
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
		</Form.SidebarSection>
	);
}
