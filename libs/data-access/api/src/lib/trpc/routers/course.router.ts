import { Prisma } from "@prisma/client";
import { database } from "@self-learning/database";
import {
	courseFormSchema,
	getFullCourseExport,
	mapCourseFormToInsert,
	mapCourseFormToUpdate,
	mapRelaxedCourseFormToInsert,
	relaxedCourseFormSchema as relaxedCourseFormSchema
} from "@self-learning/teaching";
import {
	CourseContent,
	CourseMeta,
	createCourseMeta,
	extractLessonIds,
	LessonMeta
} from "@self-learning/types";
import { getRandomId, paginate, Paginated, paginationSchema } from "@self-learning/util/common";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { authorProcedure, authProcedure, t } from "../trpc";
import { UserFromSession } from "../context";

export const courseRouter = t.router({
	listAvailableCourses: authProcedure
		.meta({
			openapi: {
				enabled: true,
				method: "GET",
				path: "/courses",
				tags: ["Courses"],
				protect: true,
				summary: "Search available courses"
			}
		})
		.input(
			paginationSchema.extend({
				title: z
					.string()
					.describe(
						"Title of the course to search for. Keep empty to list all; includes insensitive search and contains search."
					)
					.optional(),
				specializationId: z
					.string()
					.describe("Filter by assigned specializations")
					.optional(),
				authorId: z.string().describe("Filter by author username").optional(),
				pageSize: z.number().describe("Number of results per page").optional()
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
		.query(async ({ input }) => {
			const pageSize = input.pageSize ?? 20;

			const where: Prisma.CourseWhereInput = {
				title:
					input.title && input.title.length > 0
						? { contains: input.title, mode: "insensitive" }
						: undefined,
				specializations: input.specializationId
					? { some: { specializationId: input.specializationId } }
					: undefined,
				authors: input.authorId ? { some: { username: input.authorId } } : undefined
			};

			const result = await database.course.findMany({
				select: {
					slug: true,
					title: true
				},
				...paginate(pageSize, input.page),
				orderBy: { title: "asc" },
				where
			});

			return {
				result,
				pageSize: pageSize,
				page: input.page,
				totalCount: result.length
			} satisfies Paginated<{ title: string; slug: string }>;
		}),
	getCourseData: authProcedure
		.meta({
			openapi: {
				enabled: true,
				method: "GET",
				path: "/courses/{slug}",
				tags: ["Courses"],
				protect: true,
				summary: "Get course description by slug"
			}
		})
		.input(
			z.object({
				slug: z.string().describe("Unique slug of the course to get")
			})
		)
		.output(
			z.object({
				title: z.string(),
				subtitle: z.string(),
				slug: z.string(),
				lessons: z.number(),
				description: z.string().nullable()
			})
		)
		.query(async ({ input }) => {
			const course = await database.course.findUnique({
				where: {
					slug: input.slug
				}
			});

			if (!course) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: `Course not found for slug: ${input.slug}`
				});
			}

			return {
				title: course.title,
				subtitle: course.subtitle,
				slug: course.slug,
				lessons: (course.meta as CourseMeta).lessonCount,
				description: course.description
			};
		}),
	findMany: t.procedure
		.input(
			paginationSchema.extend({
				title: z.string().optional(),
				specializationId: z.string().optional()
			})
		)
		.query(async ({ input }) => {
			const pageSize = 15;

			const where: Prisma.CourseWhereInput = {
				title:
					input.title && input.title.length > 0
						? { contains: input.title, mode: "insensitive" }
						: undefined,
				specializations: input.specializationId
					? {
							some: {
								specializationId: input.specializationId
							}
						}
					: undefined
			};

			const [result, count] = await database.$transaction([
				database.course.findMany({
					select: {
						courseId: true,
						slug: true,
						imgUrl: true,
						title: true,
						authors: {
							select: {
								displayName: true
							}
						},
						subject: {
							select: {
								subjectId: true,
								title: true
							}
						}
					},
					...paginate(pageSize, input.page),
					orderBy: { title: "asc" },
					where
				}),
				database.course.count({ where })
			]);

			return {
				result,
				pageSize: pageSize,
				page: input.page,
				totalCount: count
			} satisfies Paginated<unknown>;
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
			lessonMap[lesson.lessonId] = lesson as (typeof lessons)[0] & { meta: LessonMeta };
		}

		return { content, lessonMap };
	}),
	getCourse: authorProcedure
		.input(z.object({ slug: z.string() }))
		.output(relaxedCourseFormSchema)
		.query(async ({ input }) => {
			const course = await database.course.findUniqueOrThrow({
				where: { slug: input.slug },
				include: {
					authors: true,
					provides: {
						include: {
							children: true,
							parents: true
						}
					},
					requires: {
						include: {
							children: true,
							parents: true
						}
					},
					specializations: true
				}
			});

			return {
				courseId: course.courseId,
				subjectId: course.subjectId ?? null,
				slug: course.slug,
				title: course.title,
				subtitle: course.subtitle ?? "",
				description: course.description ?? null,
				imgUrl: course.imgUrl ?? null,

				content: normalizeContent(course.content),

				specializations: course.specializations ?? [],

				authors: course.authors.map(a => ({
					username: a.username
				})),

				provides: course.provides.map(s => ({
					id: s.id,
					name: s.name,
					description: s.description ?? null,
					authorId: s.authorId,
					children: s.children.map(child => child.id),
					parents: s.parents.map(parent => parent.id)
				})),

				requires: course.requires.map(s => ({
					id: s.id,
					name: s.name,
					description: s.description ?? null,
					authorId: s.authorId,
					children: s.children.map(child => child.id),
					parents: s.parents.map(parent => parent.id)
				}))
			};
		}),
	fullExport: t.procedure.input(z.object({ slug: z.string() })).query(async ({ input, ctx }) => {
		const fullExport = await getFullCourseExport(input.slug);

		// Check if content is generally allowed to be exported
		const isOERCompatible = fullExport.lessons.every(
			lesson => lesson.license?.oerCompatible !== false
		);

		// OER-compatible or ADMIN / AUTHOR of the course
		if (!isOERCompatible && !(await authorizedUserForExport(ctx.user, input.slug))) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message:
					"Content is neither OER-compatible nor is the user an author of the course. Export not allowed."
			});
		}

		return fullExport;
	}),
	create: authProcedure.input(courseFormSchema).mutation(async ({ input, ctx }) => {
		if (!canCreate(ctx.user)) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message:
					"Creating a course requires either: admin role | admin of all related subjects | admin of all related specializations"
			});
		} else if (input.authors.length <= 0 && ctx.user.role != "ADMIN") {
			throw new TRPCError({
				code: "FORBIDDEN",
				message:
					"Deleting the last author as is not allowed, except for Admin Users. Contact the side administrator for more information. "
			});
		}

		const courseForDb = mapCourseFormToInsert(input, getRandomId());

		const created = await database.course.create({
			data: courseForDb,
			select: {
				title: true,
				slug: true,
				courseId: true
			}
		});

		console.log("[courseRouter.create]: Course created by", ctx.user.name, created);
		return created;
	}),
	createMinimal: authProcedure.input(relaxedCourseFormSchema).mutation(async ({ input, ctx }) => {
		if (!canCreate(ctx.user)) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message:
					"Creating a course requires either: admin role | admin of all related subjects | admin of all related specializations"
			});
		} else if (input.authors.length <= 0 && ctx.user.role != "ADMIN") {
			throw new TRPCError({
				code: "FORBIDDEN",
				message:
					"Deleting the last author as is not allowed, except for Admin Users. Contact the side administrator for more information. "
			});
		}

		const course = mapRelaxedCourseFormToInsert(input, getRandomId());

		const created = await database.course.create({
			data: course,
			select: {
				title: true,
				slug: true,
				courseId: true
			}
		});

		return created;
	}),
	edit: authorProcedure
		.input(
			z.object({
				courseId: z.string(),
				course: courseFormSchema
			})
		)
		.mutation(async ({ input, ctx }) => {
			const courseForDb = mapCourseFormToUpdate(input.course, input.courseId);

			if (ctx.user.role === "ADMIN") {
				return await database.course.update({
					where: {
						courseId: input.courseId
					},
					data: courseForDb,
					select: {
						title: true,
						slug: true,
						courseId: true
					}
				});
			}
			return await database.course.update({
				where: {
					courseId: input.courseId,
					authors: {
						some: {
							username: ctx.user.name
						}
					}
				},
				data: courseForDb,
				select: {
					title: true,
					slug: true,
					courseId: true
				}
			});
		}),
	editMinimal: isCourseAuthorProcedure
		.input(
			z.object({
				slug: z.string(),
				course: relaxedCourseFormSchema
			})
		)
		.mutation(async ({ input, ctx }) => {
			const courseForDb = mapRelaxedCourseFormToInsert(input.course, input.slug);

			const updated = await database.course.update({
				where: { slug: input.slug },
				data: courseForDb,
				select: {
					title: true,
					slug: true,
					courseId: true
				}
			});

			console.log("[courseRouter.edit]: Course updated by", ctx.user?.name, updated);
			return updated;
		}),
	deleteCourse: authorProcedure
		.input(z.object({ slug: z.string() }))
		.mutation(async ({ input, ctx }) => {
			return database.course.delete({
				where: {
					slug: input.slug,
					authors: { some: { username: ctx.user.name } }
				}
			});
		}),
	findLinkedEntities: authorProcedure
		.input(z.object({ slug: z.string() }))
		.query(async ({ input }) => {
			return database.course.findUnique({
				where: {
					slug: input.slug
				},
				select: {
					subject: true,
					specializations: {
						include: {
							subject: true
						}
					}
				}
			});
		})
});

function canCreate(user: UserFromSession): boolean {
	return user.role === "ADMIN" || user.isAuthor;
}

/**
 * Guard (pre-check) that checks if a user is allowed to export a course based on its role.
 * These are:
 * - ADMIN: always allowed
 * - AUTHOR: allowed if the user is an author of the course
 *
 * Further, users of other roles may also export a course, if all content is public (OER-compatible).
 * However, this is not checked here, as this requires the full course data and, thus, is done during the export.
 * @param user The user which requests the export
 * @param slug The course to export (by slug)
 * @returns true if the user is allowed to export the course, false requires to check all licenses
 */
async function authorizedUserForExport(
	user: UserFromSession | undefined,
	slug: string
): Promise<boolean> {
	if (!user) {
		return false;
	}

	if (user.role === "ADMIN") {
		return true;
	}

	const beforeExport = await database.course.findUniqueOrThrow({
		where: { slug },
		select: {
			authors: {
				select: {
					username: true
				}
			}
		}
	});

	if (beforeExport.authors.some(author => author.username === user.name)) {
		return true;
	}

	return false;
}

function normalizeContent(
	raw: unknown
): { title: string; content: { lessonId: string }[]; description?: string | null }[] {
	if (!Array.isArray(raw)) return [];

	return raw
		.filter((item): item is any => item && typeof item === "object") // Remove null and non-objects
		.map((item: any) => ({
			title: typeof item.title === "string" ? item.title : "Untitled",
			content: Array.isArray(item.content)
				? item.content.filter((c: any) => typeof c.lessonId === "string")
				: [],
			description: "description" in item ? item.description : undefined
		}));
}
