import { AccessLevel, GroupRole, Prisma } from "@prisma/client";
import { database } from "@self-learning/database";
import {
	courseFormSchema,
	getFullCourseExport,
	mapCourseFormToInsert,
	mapCourseFormToUpdate
} from "@self-learning/teaching";
import { CourseContent, CourseMeta, extractLessonIds, LessonMeta } from "@self-learning/types";
import { getRandomId, paginate, Paginated, paginationSchema } from "@self-learning/util/common";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { authProcedure, t } from "../trpc";
import { UserFromSession } from "../context";
import { hasGroupRole, hasResourceAccess } from "./permission.router";

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
				select: { slug: true, title: true },
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
		.input(z.object({ slug: z.string().describe("Unique slug of the course to get") }))
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
			const course = await database.course.findUnique({ where: { slug: input.slug } });

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
					? { some: { specializationId: input.specializationId } }
					: undefined
			};

			const [result, count] = await database.$transaction([
				database.course.findMany({
					select: {
						courseId: true,
						slug: true,
						imgUrl: true,
						title: true,
						authors: { select: { displayName: true } },
						subject: { select: { subjectId: true, title: true } }
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
			select: { content: true }
		});

		const content = (course.content ?? []) as CourseContent;
		const lessonIds = extractLessonIds(content);

		const lessons = await database.lesson.findMany({
			where: { lessonId: { in: lessonIds } },
			select: { lessonId: true, slug: true, title: true, meta: true }
		});

		const lessonMap: {
			[lessonId: string]: { title: string; lessonId: string; slug: string; meta: LessonMeta };
		} = {};

		for (const lesson of lessons) {
			lessonMap[lesson.lessonId] = lesson as (typeof lessons)[0] & { meta: LessonMeta };
		}

		return { content, lessonMap };
	}),
	fullExport: t.procedure.input(z.object({ slug: z.string() })).query(async ({ input, ctx }) => {
		const fullExport = await getFullCourseExport(input.slug);

		// Check if content is generally allowed to be exported
		const isOERCompatible = fullExport.lessons.every(
			lesson => lesson.license?.oerCompatible !== false
		);

		// OER-compatible or ADMIN / AUTHOR of the course TODO can edit or FULL?
		if (
			!isOERCompatible &&
			!(ctx.user && (await canEdit(ctx.user, fullExport.course.courseId)))
		) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message:
					"Content is neither OER-compatible nor the user has edit permission. Export not allowed."
			});
		}

		return fullExport;
	}),
	create: authProcedure.input(courseFormSchema).mutation(async ({ input, ctx }) => {
		if (!(await canCreate(ctx.user, input.groupId))) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Creating a course requires either: website ADMIN role | group MEMBER role"
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
			select: { title: true, slug: true, courseId: true }
		});

		console.log("[courseRouter.create]: Course created by", ctx.user.name, created);
		return created;
	}),
	edit: authProcedure
		.input(z.object({ courseId: z.string(), course: courseFormSchema }))
		.mutation(async ({ input, ctx }) => {
			const courseForDb = mapCourseFormToUpdate(input.course, input.courseId);

			if (!(await canEdit(ctx.user, input.courseId))) {
				throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions" });
			}
			return await database.course.update({
				where: { courseId: input.courseId },
				data: courseForDb,
				select: { title: true, slug: true, courseId: true }
			});
		}),
	deleteCourse: authProcedure
		.input(z.object({ slug: z.string() }))
		.mutation(async ({ input, ctx }) => {
			if (!(await canEditBySlug(ctx.user, input.slug))) {
				throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions" });
			}
			return database.course.delete({
				where: { slug: input.slug, authors: { some: { username: ctx.user.name } } }
			});
		}),
	findLinkedEntities: authProcedure
		.input(z.object({ slug: z.string() }))
		.query(async ({ input, ctx }) => {
			if (!(await canEditBySlug(ctx.user, input.slug))) {
				throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions" });
			}
			return database.course.findUnique({
				where: { slug: input.slug },
				select: { subject: true, specializations: { include: { subject: true } } }
			});
		}),

	getProgress: authProcedure
		.meta({
			openapi: {
				enabled: true,
				method: "GET",
				path: "/courses/{slug}/progress",
				tags: ["Courses"],
				protect: true,
				summary: "Get course progress for a list of students (teachers/admins only)"
			}
		})
		.input(
			z.object({
				slug: z.string().describe("Unique slug of the course"),
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
				z.object({ username: z.string(), progress: z.number().min(0).max(100).nullable() })
			)
		)
		.query(async ({ input, ctx }) => {
			if (!(await canEditBySlug(ctx.user, input.slug))) {
				throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions" });
			}

			const usernames = input.usernames
				? input.usernames
						.split(",")
						.map(u => u.trim())
						.filter(Boolean)
				: [];

			// check if course exists (404 if not)
			const course = await database.course.findUnique({
				where: { slug: input.slug },
				select: { courseId: true, content: true }
			});

			if (!course) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: `Course not found for slug: ${input.slug}`
				});
			}

			const content = (course.content ?? []) as CourseContent;
			const lessonIds = extractLessonIds(content);
			const totalLessons = lessonIds.length;

			if (totalLessons === 0) {
				return usernames.map(username => ({ username, progress: null }));
			}

			// Find enrolled students from input usernames in this course
			const enrollments = await database.enrollment.findMany({
				where: { courseId: course.courseId, username: { in: usernames } },
				select: { username: true }
			});

			if (enrollments.length === 0) {
				return [];
			}

			// Count completed lessons per student
			const completedLessons = await database.completedLesson.groupBy({
				by: ["username"],
				where: {
					courseId: course.courseId,
					lessonId: { in: lessonIds },
					username: { in: enrollments.map(e => e.username) }
				},
				_count: { lessonId: true }
			});

			return enrollments.map(enrollment => {
				const completedCount =
					completedLessons.find(c => c.username === enrollment.username)?._count
						.lessonId ?? 0;
				const progressPercent = Math.round((completedCount / totalLessons) * 100);
				return { username: enrollment.username, progress: progressPercent };
			});
		})
});

async function canCreate(user: UserFromSession, groupId: string): Promise<boolean> {
	if (user.role === "ADMIN") return true;
	return await hasGroupRole(user.id, groupId, GroupRole.MEMBER);
}

// TODO for now all can read
// async function canRead(user: UserFromSession, courseId: string): Promise<boolean> {
// 	if (user.role === "ADMIN") return true;
// 	return await hasAccessLevel(user, PermissionResourceEnum.Enum.SUBJECT, courseId, "VIEW");
// }

async function getIdBySlug(slug: string) {
	const { courseId } = await database.course.findUniqueOrThrow({
		where: { slug },
		select: { courseId: true }
	});
	return courseId;
}

async function canEdit(user: UserFromSession, courseId: string): Promise<boolean> {
	if (user.role === "ADMIN") return true;
	return await hasResourceAccess({ userId: user.id, courseId, accessLevel: AccessLevel.EDIT });
}

async function canEditBySlug(user: UserFromSession, slug: string): Promise<boolean> {
	if (user.role === "ADMIN") return true;
	const courseId = await getIdBySlug(slug);
	return await canEdit(user, courseId);
}
