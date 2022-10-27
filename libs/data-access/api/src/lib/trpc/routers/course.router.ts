import { database } from "@self-learning/database";
import {
	courseFormSchema,
	mapCourseFormToInsert,
	mapCourseFormToUpdate
} from "@self-learning/teaching";
import { CourseContent, extractLessonIds, LessonMeta } from "@self-learning/types";
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
	getContent: t.procedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
		const course = await database.course.findUniqueOrThrow({
			where: { slug: input.slug },
			select: {
				content: true
			}
		});

		const content = (course.content ?? []) as CourseContent;
		const lessonIds = extractLessonIds(content);

		const lessons = await database.lesson.findMany({
			where: { lessonId: { in: lessonIds } },
			select: {
				lessonId: true,
				slug: true,
				title: true,
				meta: true
			}
		});

		const lessonMap: {
			[lessonId: string]: { title: string; lessonId: string; slug: string; meta: LessonMeta };
		} = {};

		for (const lesson of lessons) {
			lessonMap[lesson.lessonId] = lesson as typeof lessons[0] & { meta: LessonMeta };
		}

		return { content, lessonMap };
	}),
	create: authProcedure.input(courseFormSchema).mutation(async ({ input }) => {
		const courseForDb = mapCourseFormToInsert(input, getRandomId());

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
			const courseForDb = mapCourseFormToUpdate(input.course, input.courseId);

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
