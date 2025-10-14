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
		.meta({
			openapi: {
				enabled: true,
				method: "GET",
				path: "/lessons",
				tags: ["Lessons"],
				protect: true,
				summary: "Search available lessons"
			}
		})
		.input(
			paginationSchema.extend({
				title: z.string().optional(),
				authorName: z.string().optional(),
				pageSize: z.number().optional()
			})
		)
		.output(
			z.object({
				result: z.array(z.object({ title: z.string(), slug: z.string() })),
				pageSize: z.number(),
				page: z.number(),
				totalCount: z.number()
			})
		)
		.query(async ({ input: { title, page, authorName, pageSize } }) => {
			const actualPageSize = pageSize ?? 15;
			const { lessons, count } = await findLessons({
				title,
				authorName,
				...paginate(actualPageSize, page)
			});

			return {
				result: lessons.map(lesson => ({
					title: lesson.title,
					slug: lesson.slug
				})),
				pageSize: actualPageSize,
				page: page,
				totalCount: count
			};
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
		}),

	getLessonData: authProcedure
		.meta({
			openapi: {
				enabled: true,
				method: "GET",
				path: "/lessons/{slug}",
				tags: ["Lessons"],
				protect: true,
				summary: "Get lesson description by slug"
			}
		})
		.input(
			z.object({
				slug: z.string().describe("Unique slug of the lesson to get")
			})
		)
		.output(
			z.object({
				title: z.string(),
				slug: z.string(),
				lessonId: z.string(),
				description: z.string().nullable()
			})
		)
		.query(async ({ input }) => {
			const lesson = await database.lesson.findUnique({
				where: {
					slug: input.slug
				},
				select: {
					lessonId: true,
					title: true,
					slug: true,
					description: true
				}
			});

			if (!lesson) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: `Lesson not found for slug: ${input.slug}`
				});
			}

			return {
				title: lesson.title,
				slug: lesson.slug,
				lessonId: lesson.lessonId,
				description: lesson.description
			};
		}),

	getProgress: authorProcedure
		.meta({
			openapi: {
				enabled: true,
				method: "GET",
				path: "/lessons/{slug}/progress",
				tags: ["Lessons"],
				protect: true,
				summary: "Get lesson progress for a list of students (teachers/admins only)"
			}
		})
		.input(
			z.object({
				slug: z.string().describe("Unique slug of the lesson"),
				usernames: z
					.string()
					.optional()
					.describe(
						"Comma separated list of student usernames to get progress for, e.g. 'user1,user2'"
					)
			})
		)
		.output(
			z.array(
				z.object({
					username: z.string(),
					progress: z.number().min(0).max(1)
				})
			)
		)
		.query(async ({ input, ctx }) => {
			const usernames = input.usernames
				? input.usernames
						.split(",")
						.map(u => u.trim())
						.filter(Boolean)
				: [];

			if (usernames.length === 0) {
				return [];
			}

			// Check if lesson exists (404 if not)
			const lesson = await database.lesson.findUnique({
				where: { slug: input.slug },
				select: { lessonId: true }
			});

			if (!lesson) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: `Lesson not found for slug: ${input.slug}`
				});
			}

			// Check if user is authorized (403 if not)
			const userIsAuthor = await database.lesson.findFirst({
				where: {
					slug: input.slug,
					authors: { some: { username: ctx.user.name } }
				},
				select: { lessonId: true }
			});

			if (!userIsAuthor) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You are not an author of this lesson."
				});
			}

			// Find valid users
			const validUsers = await database.user.findMany({
				where: {
					name: { in: usernames }
				},
				select: {
					name: true
				}
			});

			if (validUsers.length === 0) {
				return [];
			}

			// Get valid usernames
			const validUsernames = validUsers.map(u => u.name);

			// Find completed lessons for valid users only
			const completedLessons = await database.completedLesson.findMany({
				where: {
					lessonId: lesson.lessonId,
					username: { in: validUsernames }
				},
				select: {
					username: true
				}
			});

			return validUsers.map(user => {
				const completedCount = completedLessons.find(cl => cl.username === user.name)
					? 1
					: 0;
				return {
					username: user.name,
					progress: completedCount
				};
			});
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
