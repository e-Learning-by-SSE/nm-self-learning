import { database } from "@self-learning/database";
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { courseFormSchema, mapFromCourseFormToDbSchema } from "@self-learning/teaching";
import { getRandomId } from "@self-learning/util/common";
import { z } from "zod";
import { createProtectedRouter } from "../create-router";

export const courseRouter = createProtectedRouter()
	.query("findMany", {
		input: z.object({
			title: z.string().optional()
		}),
		resolve({ input }) {
			return findCourses(input.title);
		}
	})
	.mutation("create", {
		input: courseFormSchema,
		async resolve({ input }) {
			const courseForDb = mapFromCourseFormToDbSchema(input, getRandomId());

			const created = await database.course.create({
				data: courseForDb,
				select: {
					title: true,
					slug: true,
					courseId: true
				}
			});

			console.log("[courseRouter]: Created course", created);
			return created;
		}
	})
	.mutation("edit", {
		input: z.object({
			courseId: z.string(),
			course: courseFormSchema
		}),
		async resolve({ input }) {
			const courseForDb = mapFromCourseFormToDbSchema(input.course, input.courseId);

			const updated = await database.course.update({
				where: { courseId: input.courseId },
				data: courseForDb,
				select: {
					title: true,
					slug: true,
					courseId: true
				}
			});

			console.log("[courseRouter]: Course updated", updated);
			return updated;
		}
	});

export async function findCourses(title?: string) {
	return database.course.findMany({
		include: {
			authors: true,
			subject: true
		},
		where: {
			title: title ? { contains: title, mode: "insensitive" } : undefined
		}
	});
}
