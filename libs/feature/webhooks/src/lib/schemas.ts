import * as yup from "yup";

export const courseEntrySchema = yup
	.object({
		courseId: yup.string().required(),
		title: yup.string().required(),
		slug: yup.string().required(),
		subtitle: yup.string().required(),
		image: yup
			.object({
				url: yup.string()
			})
			.nullable(),
		content: yup.array().of(
			yup.object({
				title: yup.string().required(),
				description: yup.string().nullable(),
				lessons: yup.array().of(
					yup.object({
						lesson: yup.object({
							lessonId: yup.string().required(),
							slug: yup.string().required(),
							title: yup.string().required(),
							subtitle: yup.string().nullable()
						})
					})
				)
			})
		)
	})
	.typeError(
		"'entry' must be an object with the following keys: courseId, title, slug, subtitle, image.url (optional)"
	);

export type CourseEntry = yup.InferType<typeof courseEntrySchema>;
