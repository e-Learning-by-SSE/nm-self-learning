import { Prisma } from "@prisma/client";
import { courseContentSchema } from "@self-learning/types";
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
	authors: z.array(
		z.object({
			slug: z.string()
			// permissions: z.any() // currently not used, but could be added here
		})
	),
	content: courseContentSchema
});

export type CourseFormModel = z.infer<typeof courseFormSchema>;

export function mapCourseFormToInsert(
	course: CourseFormModel,
	courseId: string
): Prisma.CourseCreateInput {
	const { title, slug, subtitle, description, imgUrl, content, subjectId, authors } = course;

	const courseForDb: Prisma.CourseCreateInput = {
		courseId,
		slug,
		title,
		subtitle,
		content: content,
		imgUrl: stringOrNull(imgUrl),
		description: stringOrNull(description),
		authors: {
			connect: authors.map(author => ({ slug: author.slug }))
		},
		subject: subjectId ? { connect: { subjectId } } : undefined
	};

	return courseForDb;
}

export function mapCourseFormToUpdate(
	course: CourseFormModel,
	courseId: string
): Prisma.CourseUpdateInput {
	const { title, slug, subtitle, description, imgUrl, content, subjectId, authors } = course;

	const courseForDb: Prisma.CourseUpdateInput = {
		courseId,
		slug,
		title,
		subtitle,
		content,
		imgUrl: stringOrNull(imgUrl),
		description: stringOrNull(description),
		authors: {
			set: authors.map(author => ({ slug: author.slug }))
		},
		subject: subjectId ? { connect: { subjectId } } : undefined
	};

	return courseForDb;
}
