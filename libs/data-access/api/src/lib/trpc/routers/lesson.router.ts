import { Prisma } from "@prisma/client";
import { database } from "@self-learning/database";
import { createLessonMeta, lessonSchema } from "@self-learning/types";
import { getRandomId } from "@self-learning/util/common";
import { z } from "zod";
import { authProcedure, t } from "../trpc";

export const lessonRouter = t.router({
	findOneAllProps: authProcedure.input(z.object({ lessonId: z.string() })).query(({ input }) => {
		return database.lesson.findUniqueOrThrow({
			where: { lessonId: input.lessonId }
		});
	}),
	findOne: authProcedure.input(z.object({ lessonId: z.string() })).query(({ input }) => {
		return database.lesson.findUniqueOrThrow({
			where: { lessonId: input.lessonId },
			select: { lessonId: true, title: true, slug: true, meta: true }
		});
	}),
	findMany: authProcedure.input(z.object({ title: z.string().optional() })).query(({ input }) => {
		return findLessons({ title: input.title, take: 15 });
	}),
	create: authProcedure.input(lessonSchema).mutation(async ({ input }) => {
		const createdLesson = await database.lesson.create({
			data: {
				...input,
				authors: {
					connect: input.authors.map(a => ({ slug: a.slug }))
				},
				content: input.content as Prisma.InputJsonArray,
				lessonId: getRandomId(),
				meta: createLessonMeta(input) as unknown as Prisma.JsonObject
			},
			select: {
				lessonId: true,
				slug: true,
				title: true
			}
		});

		console.log("[lessonRouter]: Created lesson", createdLesson);
		return createdLesson;
	}),
	edit: authProcedure
		.input(
			z.object({
				lessonId: z.string(),
				lesson: lessonSchema
			})
		)
		.mutation(async ({ input }) => {
			const updatedLesson = await database.lesson.update({
				where: { lessonId: input.lessonId },
				data: {
					...input.lesson,
					lessonId: input.lessonId,
					authors: {
						set: input.lesson.authors.map(a => ({ slug: a.slug }))
					},
					meta: createLessonMeta(input.lesson) as unknown as Prisma.JsonObject
				},
				select: {
					lessonId: true,
					slug: true,
					title: true
				}
			});

			console.log("[lessonRouter]: Updated lesson", updatedLesson);
			return updatedLesson;
		})
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
