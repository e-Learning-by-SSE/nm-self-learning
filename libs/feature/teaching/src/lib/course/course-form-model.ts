import { CourseType, Prisma } from "@prisma/client";
import {
	authorsRelationSchema,
	courseContentSchema,
	createCourseMeta,
	ResourcePermissionsFormSchema,
	ResourceSkillsFormSchema
} from "@self-learning/types";
import { stringOrNull } from "@self-learning/util/common";
import { z } from "zod";

export const courseFormSchema = z
	.object({
		type: z.enum(CourseType),
		courseId: z.string().nullable(),
		subjectId: z.string().nullable(),
		slug: z.string().min(3),
		title: z.string().min(3),
		subtitle: z.string().min(3),
		description: z.string().nullable(),
		imgUrl: z.string().nullable(),
		version: z.string().nullable(),
		authors: authorsRelationSchema,
		content: courseContentSchema,
		specializationId: z.string().nullable().optional(),
		permissions: ResourcePermissionsFormSchema
	})
	.extend(ResourceSkillsFormSchema.shape);

export type CourseFormModel = z.infer<typeof courseFormSchema>;

export type PermissionsForCreate = NonNullable<Prisma.CourseCreateInput["permissions"]>;
export type PermissionsForUpdate = Prisma.CourseUpdateInput["permissions"];

export function mapCourseFormToInsert(
	course: CourseFormModel,
	courseId: string,
	permissions: PermissionsForCreate
): Prisma.CourseCreateInput {
	const { type, title, slug, subtitle, description, imgUrl, content, subjectId, authors } =
		course;

	const courseForDb: Prisma.CourseCreateInput = {
		type,
		courseId,
		slug,
		title,
		subtitle,
		content: content,
		version: Date.now().toString(), // always overwrite? TODO
		imgUrl: stringOrNull(imgUrl),
		description: stringOrNull(description),
		meta: createCourseMeta(course),
		authors: { connect: authors.map(author => ({ username: author.username })) },
		subject: subjectId ? { connect: { subjectId } } : undefined,
		permissions
	};

	return courseForDb;
}

export function mapCourseFormToUpdate(
	course: CourseFormModel,
	courseId: string,
	permissions: PermissionsForUpdate
): Prisma.CourseUpdateInput {
	const { title, slug, subtitle, description, imgUrl, content, subjectId, authors } = course;

	// TODO cannot change course type
	const courseForDb: Prisma.CourseUpdateInput = {
		courseId,
		slug,
		title,
		subtitle,
		content,
		version: Date.now().toString(), // always overwrite? TODO
		imgUrl: stringOrNull(imgUrl),
		description: stringOrNull(description),
		meta: createCourseMeta(course),
		authors: { set: authors.map(author => ({ username: author.username })) },
		subject: subjectId ? { connect: { subjectId } } : undefined,
		permissions
	};

	return courseForDb;
}
