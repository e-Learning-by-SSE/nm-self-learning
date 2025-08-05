import { Prisma } from "@prisma/client";
import {
	authorsRelationSchema,
	courseContentSchema,
	createCourseMeta,
	skillFormSchema,
	specializationSchema
} from "@self-learning/types";
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
	content: courseContentSchema,
	specializationId: z.string().nullable().optional(),
	provides: z.array(skillFormSchema).nullable().optional(),
	requires: z.array(skillFormSchema).nullable().optional()
});

export const relaxedCourseFormSchema = z.object({
	courseId: z.string().nullable(),
	subjectId: z.string().nullable().optional(),
	slug: z.string().min(3),
	title: z.string().min(3),
	subtitle: z.string().optional().default(""),
	description: z.string().nullable().optional(),
	imgUrl: z.string().nullable().optional(),
	authors: authorsRelationSchema,
	content: courseContentSchema.optional().default([]),
	specializations: z.array(specializationSchema).optional().default([]),
	provides: z.array(skillFormSchema).optional().default([]),
	requires: z.array(skillFormSchema).optional().default([])
});

export type CourseFormModel = z.infer<typeof courseFormSchema>;
export type RelaxedCourseFormModel = z.infer<typeof relaxedCourseFormSchema>;

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

export function mapRelaxedCourseFormToInsert(
	course: RelaxedCourseFormModel,
	courseId: string
): Prisma.CourseCreateInput {
	const {
		title,
		slug,
		subtitle,
		description,
		imgUrl,
		content,
		subjectId,
		specializations,
		provides,
		requires,
		authors
	} = course;

	return {
		courseId,
		slug,
		title,
		subtitle,
		imgUrl: stringOrNull(imgUrl),
		description: stringOrNull(description),
		content,
		meta: createCourseMeta(course),
		authors: {
			connect: authors.map(author => ({ username: author.username }))
		},
		subject: subjectId ? { connect: { subjectId } } : undefined,
		specializations: {
			connect: (specializations ?? []).map(specialization => ({
				specializationId: specialization.specializationId
			}))
		},
		provides: {
			connect: (provides ?? []).map(skill => ({ id: skill.id }))
		},
		requires: {
			connect: (requires ?? []).map(skill => ({ id: skill.id }))
		}
	};
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
