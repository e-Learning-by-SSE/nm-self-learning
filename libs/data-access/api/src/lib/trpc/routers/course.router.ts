import { database } from "@self-learning/database";
import { courseFormSchema, mapFromCourseFormToDbSchema } from "@self-learning/teaching";
import { getRandomId } from "@self-learning/util/common";
import { z } from "zod";
import { authProcedure, t } from "../trpc";

export const courseRouter = t.router({
	findMany: t.procedure
		.input(
			z.object({
				title: z.string().optional()
			})
		)
		.query(async ({ input }) => {
			return database.course.findMany({
				include: {
					authors: true,
					subject: true
				},
				where: {
					title: input.title ? { contains: input.title, mode: "insensitive" } : undefined
				}
			});
		}),
	create: authProcedure.input(courseFormSchema).mutation(async ({ input }) => {
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
	}),
	edit: authProcedure
		.input(
			z.object({
				courseId: z.string(),
				course: courseFormSchema
			})
		)
		.mutation(async ({ input }) => {
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
		})
});
