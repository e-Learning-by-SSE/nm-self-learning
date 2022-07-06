import { Prisma } from "@prisma/client";
import { database } from "@self-learning/database";
import { lessonSchema } from "@self-learning/types";
import { getRandomId } from "@self-learning/util/common";
import { z } from "zod";
import { createProtectedRouter } from "../create-router";

export const lessonRouter = createProtectedRouter()
	.query("findMany", {
		input: z.object({
			title: z.string().optional()
		}),
		resolve({ input }) {
			return findLessons({ title: input.title, take: 15 });
		}
	})
	.mutation("create", {
		input: lessonSchema,
		async resolve({ input }) {
			const createdLesson = await database.lesson.create({
				data: {
					...input,
					content: input.content as Prisma.InputJsonArray,
					lessonId: getRandomId()
				},
				select: {
					lessonId: true,
					slug: true,
					title: true
				}
			});

			console.log("[lessonRouter]: Created lesson", createdLesson);
			return createdLesson;
		}
	})
	.mutation("edit", {
		input: z.object({
			lessonId: z.string(),
			lesson: lessonSchema
		}),
		async resolve({ input }) {
			const updatedLesson = await database.lesson.update({
				where: { lessonId: input.lessonId },
				data: {
					...input.lesson,
					lessonId: input.lessonId
				},
				select: {
					lessonId: true,
					slug: true,
					title: true
				}
			});

			console.log("[lessonRouter]: Updated lesson", updatedLesson);
			return updatedLesson;
		}
	});

export async function findLessons({
	title,
	skip,
	take
}: {
	title?: string;
	skip?: number;
	take?: number;
}) {
	const where: Prisma.LessonWhereInput = {
		title:
			typeof title === "string" && title.length > 0
				? { contains: title, mode: "insensitive" }
				: undefined
	};

	const [lessons, count] = await Promise.all([
		database.lesson.findMany({
			select: {
				lessonId: true,
				title: true,
				slug: true,
				authors: {
					select: {
						displayName: true
					}
				}
			},
			where,
			take,
			skip
		}),
		database.lesson.count({
			where
		})
	]);

	return { lessons, count };
}
