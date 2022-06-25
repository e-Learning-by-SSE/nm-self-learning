import { array, InferType, number, object, string } from "yup";

export const courseFormSchema = object({
	courseId: string().nullable(),
	subjectId: number(),
	slug: string().required(),
	title: string().required(),
	subtitle: string().required(),
	description: string().nullable(),
	imgUrl: string().nullable(),
	content: array()
		.of(
			object({
				chapterId: string().required(),
				title: string().required(),
				description: string().nullable(),
				lessons: array()
					.of(
						object({
							title: string(),
							slug: string(),
							lessonId: string().required()
						})
					)
					.required()
			})
		)
		.required()
}).required();

export type CourseFormModel = InferType<typeof courseFormSchema>;
