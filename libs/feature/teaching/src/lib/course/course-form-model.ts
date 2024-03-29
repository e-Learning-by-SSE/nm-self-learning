import { Prisma } from "@prisma/client";
import { authorsRelationSchema, courseContentSchema, createCourseMeta } from "@self-learning/types";
import { stringOrNull } from "@self-learning/util/common";
import { z } from "zod";

export const courseFormSchema = z.object({
	courseId: z.string().nullable(),
	subjectId: z.string().nullable(),
	slug: z.string().min(3),
	title: z.string().min(3),
	subtitle: z.string().min(3),
	description: z.string().nullable(),
	imgUrl: z.string().nullable(),
	authors: authorsRelationSchema,
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
		meta: createCourseMeta(course),
		authors: {
			connect: authors.map(author => ({ username: author.username }))
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
		meta: createCourseMeta(course),
		authors: {
			set: authors.map(author => ({ username: author.username }))
		},
		subject: subjectId ? { connect: { subjectId } } : undefined
	};

	return courseForDb;
}
