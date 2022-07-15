import { Prisma } from "@prisma/client";
import { CourseContent } from "@self-learning/types";
import { stringOrNull } from "@self-learning/util/common";
import { z } from "zod";

export const courseFormSchema = z.object({
	courseId: z.string().nullable(),
	subjectId: z.number().nullable(),
	slug: z.string().min(3),
	title: z.string().min(3),
	subtitle: z.string().min(3),
	description: z.string().nullable(),
	imgUrl: z.string().nullable(),
	content: z.array(
		z.object({
			chapterId: z.string(),
			title: z.string().min(3),
			description: z.string().nullable(),
			lessons: z.array(
				z.object({
					title: z.string(),
					slug: z.string(),
					lessonId: z.string()
				})
			)
		})
	)
});

export type CourseFormModel = z.infer<typeof courseFormSchema>;

export function mapFromCourseFormToDbSchema(
	course: CourseFormModel,
	courseId: string
): Prisma.CourseCreateInput {
	const { title, slug, subtitle, description, imgUrl, content, subjectId } = course;

	const courseForDb: Prisma.CourseCreateInput = {
		courseId,
		slug,
		title,
		subtitle,
		content: mapContent(content),
		imgUrl: stringOrNull(imgUrl),
		description: stringOrNull(description),
		subject: subjectId ? { connect: { subjectId } } : undefined
	};

	return courseForDb;
}

function mapContent(contentFromForm: CourseFormModel["content"]): CourseContent {
	return []; // TODO
}
