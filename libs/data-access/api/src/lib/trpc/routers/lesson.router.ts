import { Course, Prisma } from "@prisma/client";
import { database } from "@self-learning/database";
import { createLessonMeta, lessonSchema } from "@self-learning/types";
import { getRandomId, paginate, Paginated, paginationSchema } from "@self-learning/util/common";
import { z } from "zod";
import { authorProcedure, authProcedure, t } from "../trpc";
import { TRPCError } from "@trpc/server";

export const lessonRouter = t.router({
	findOneAllProps: authProcedure.input(z.object({ lessonId: z.string() })).query(({ input }) => {
		return database.lesson.findUniqueOrThrow({
			where: { lessonId: input.lessonId },
			include: {
				authors: {
					select: {
						username: true
					}
				},
				requires: {
					select: {
						id: true,
						name: true,
						description: true,
						children: true,
						repositoryId: true,
						parents: true
					}
				},
				provides: {
					select: {
						id: true,
						name: true,
						description: true,
						children: true,
						repositoryId: true,
						parents: true
					}
				}
			}
		});
	}),
	findOne: authProcedure.input(z.object({ lessonId: z.string() })).query(({ input }) => {
		return database.lesson.findUniqueOrThrow({
			where: { lessonId: input.lessonId },
			select: { lessonId: true, title: true, slug: true, meta: true }
		});
	}),
	findMany: authProcedure
		.input(
			paginationSchema.extend({
				title: z.string().optional(),
				authorName: z.string().optional()
			})
		)
		.query(async ({ input: { title, page, authorName } }) => {
			const pageSize = 15;
			const { lessons, count } = await findLessons({
				title,
				authorName,
				...paginate(pageSize, page)
			});
			return {
				result: lessons,
				totalCount: count,
				page,
				pageSize
			} satisfies Paginated<unknown>;
		}),
	create: authProcedure.input(lessonSchema).mutation(async ({ input, ctx }) => {
		const createdLesson = await database.lesson.create({
			data: {
				...input,
				quiz: input.quiz ? (input.quiz as Prisma.JsonObject) : Prisma.JsonNull,
				authors: {
					connect: input.authors.map(a => ({ username: a.username }))
				},
				licenseId: input.licenseId,
				requires: {
					connect: input.requires.map(r => ({ id: r.id }))
				},
				provides: {
					connect: input.provides.map(r => ({ id: r.id }))
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

		const providedSkillIds = input.provides.map(s => s.id);

		const relevantCourses = await database.dynCourse.findMany({
			where: {
				teachingGoals: {
					some: {
						id: { in: providedSkillIds }
					}
				}
			},
			select: {
				courseId: true
			}
		});

		for (const course of relevantCourses) {
			await database.dynCourse.update({
				where: { courseId: course.courseId },
				data: {
					courseVersion: Date.now().toString()
				}
			});
		}

		console.log("[lessonRouter.create]: Lesson created by", ctx.user.name, createdLesson);
		return createdLesson;
	}),
	edit: authProcedure
		.input(
			z.object({
				lessonId: z.string(),
				lesson: lessonSchema
			})
		)
		.mutation(async ({ input, ctx }) => {
			const updatedLesson = await database.lesson.update({
				where: { lessonId: input.lessonId },
				data: {
					...input.lesson,
					quiz: input.lesson.quiz
						? (input.lesson.quiz as Prisma.JsonObject)
						: Prisma.JsonNull,
					lessonId: input.lessonId,
					authors: {
						set: input.lesson.authors.map(a => ({ username: a.username }))
					},
					licenseId: input.lesson.licenseId,
					requires: {
						set: input.lesson.requires.map(r => ({ id: r.id }))
					},
					provides: {
						set: input.lesson.provides.map(r => ({ id: r.id }))
					},
					meta: createLessonMeta(input.lesson) as unknown as Prisma.JsonObject
				},
				select: {
					lessonId: true,
					slug: true,
					title: true
				}
			});

			console.log("[lessonRouter.edit]: Lesson updated by", ctx.user.name, updatedLesson);
			return updatedLesson;
		}),
	findLinkedLessonEntities: authorProcedure
		.input(z.object({ lessonId: z.string() }))
		.query(async ({ input }) => {
			const courses = await database.$queryRaw`
				SELECT *
				FROM "Course"
				WHERE EXISTS (SELECT 1
							  FROM jsonb_array_elements("Course".content) AS chapter
									   CROSS JOIN jsonb_array_elements(chapter - > 'content') AS lesson
							  WHERE lesson ->>'lessonId' = ${input.lessonId})
			`;
			return courses as Course[];
		}),
	deleteLesson: authorProcedure
		.input(z.object({ lessonId: z.string() }))
		.mutation(async ({ input, ctx }) => {
			if (ctx.user?.role === "ADMIN") {
				await database.lesson.deleteMany({
					where: {
						lessonId: input.lessonId
					}
				});
			} else {
				const deleted = await database.lesson.deleteMany({
					where: {
						lessonId: input.lessonId,
						authors: {
							some: {
								username: ctx.user?.name
							}
						}
					}
				});

				if (deleted.count === 0) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "User is not an author of this lesson or lesson does not exist."
					});
				}
			}
		})
});

export async function findLessons({
	title,
	authorName,
	skip,
	take
}: {
	title?: string;
	authorName?: string;
	skip?: number;
	take?: number;
}) {
	const where: Prisma.LessonWhereInput = {
		title:
			typeof title === "string" && title.length > 0
				? { contains: title, mode: "insensitive" }
				: undefined,
		authors: authorName
			? {
					some: {
						username: authorName
					}
				}
			: undefined
	};

	const [lessons, count] = await database.$transaction([
		database.lesson.findMany({
			select: {
				lessonId: true,
				title: true,
				slug: true,
				updatedAt: true,
				authors: {
					select: {
						displayName: true,
						slug: true,
						imgUrl: true
					}
				}
			},
			orderBy: { updatedAt: "desc" },
			where,
			take,
			skip
		}),
		database.lesson.count({ where })
	]);

	return { lessons, count };
}
