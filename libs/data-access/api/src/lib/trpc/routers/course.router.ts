import { AccessLevel, CourseType, Prisma } from "@prisma/client";
import { database, logJobProgress } from "@self-learning/database";
import {
	courseFormSchema,
	getFullCourseExport,
	mapCourseFormToInsert,
	mapCourseFormToUpdate
} from "@self-learning/teaching";
import {
	CourseChapter,
	CourseContent,
	CourseMeta,
	createCourseMeta,
	extractLessonIds,
	greaterAccessLevel,
	LessonMeta
} from "@self-learning/types";
import { getRandomId, paginate, Paginated, paginationSchema } from "@self-learning/util/common";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { authProcedure, authorProcedure, t } from "../trpc";
import { getCourseResource } from "../../permissions/course.utils";
import {
	canCreate,
	canDelete,
	canEdit,
	preparePermissionsForCreate,
	prepareResourceUpdate
} from "../../permissions/permission.service";
import { randomUUID } from "crypto";
import { resolveLessonPath } from "../../lesson-path/lesson-path.service";
import { createCourseSummary, mapCourseContent } from "@self-learning/course";
import { workerServiceClient } from "@self-learning/worker-api";

export const courseRouter = t.router({
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
	getMyCourses: authProcedure
		.input(
			paginationSchema.extend({
				title: z.string().optional()
			})
		)
		.query(async ({ input, ctx }) => {
			const pageSize = 15;
			const memberships = await database.group.findMany({
				where: { members: { some: { userId: ctx.user.id } } },
				select: { id: true }
			});

			const where: Prisma.CourseWhereInput = {
				title:
					input.title && input.title.length > 0
						? { contains: input.title, mode: "insensitive" }
						: undefined,
				permissions: {
					some: {
						group: { id: { in: memberships.map(m => m.id) } }
					}
				}
			};

			const [result, count] = await database.$transaction([
				database.course.findMany({
					select: {
						slug: true,
						title: true,
						courseId: true,
						imgUrl: true,
						permissions: {
							select: {
								accessLevel: true
							}
						}
					},
					...paginate(pageSize, input.page),
					orderBy: { title: "asc" },
					where
				}),
				database.course.count({ where })
			]);

			const res = result.map(r => ({
				...r,
				accessLevel: r.permissions.reduce<AccessLevel>(
					(max, p) => (greaterAccessLevel(p.accessLevel, max) ? p.accessLevel : max),
					r.permissions[0].accessLevel // always at least one permission due to query is present
				)
			}));
			return {
				result: res,
				pageSize: pageSize,
				page: input.page,
				totalCount: count
			} satisfies Paginated<unknown>;
		}),
	findMany: t.procedure
		.input(
			paginationSchema.extend({
				title: z.string().optional(),
				specializationId: z.string().optional(),
				type: z.enum(CourseType).optional()
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
					: undefined,
				type: input.type
			};

			const [resultCourse, count] = await database.$transaction([
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

			const result = resultCourse.sort((a, b) => a.title.localeCompare(b.title));

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
			[lessonId: string]: {
				title: string;
				lessonId: string;
				slug: string;
				meta: LessonMeta;
			};
		} = {};

		for (const lesson of lessons) {
			lessonMap[lesson.lessonId] = lesson as (typeof lessons)[0] & { meta: LessonMeta };
		}

		return { content, lessonMap };
	}),
	getCourse: authorProcedure
		.input(z.object({ slug: z.string() }))
		.output(courseFormSchema)
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
					specializations: true,
					permissions: {
						select: {
							groupId: true,
							group: true,
							accessLevel: true
						}
					}
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

				type: course.type,
				version: course.version,

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
				})),

				permissions: course.permissions.map(p => ({
					groupId: p.groupId,
					groupName: p.group.name,
					accessLevel: p.accessLevel
				}))
			};
		}),
	getCoursePreview: authProcedure
		.input(
			z.object({
				courseId: z.string(),
				knowledge: z.array(z.string())
			})
		)
		.query(async ({ input }) => {
			// TODO any permissions? I think VIEW is enough
			const course = await database.course.findUnique({
				where: { courseId: input.courseId },
				select: {
					title: true,
					type: true,
					authors: true,
					subtitle: true,
					slug: true,
					description: true,
					imgUrl: true,
					provides: {
						select: {
							id: true,
							name: true,
							description: true,
							authorId: true,
							children: { select: { id: true } }
						}
					}
				}
			});
			if (!course) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Failed to find requested course"
				});
			}
			if (course.type !== CourseType.DYNAMIC) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Requested course is not dynamic"
				});
			}

			const path = await resolveLessonPath({
				courseProvides: course.provides,
				userKnowledgeIds: input.knowledge
			});
			// Unsolvable path is an empty preview, not an error the page must catch.
			const courseContent = path
				? [
						{
							title: "generatedLessonPathTitle",
							description: "generatedLessonPathDescription",
							content: path
						} as CourseChapter
					]
				: [];

			const content = await mapCourseContent(courseContent);
			const summary = createCourseSummary(content);

			return {
				course: course,
				content: content,
				summary: summary
			};
		}),
	createCourseGraphJob: authProcedure
		.input(
			z.object({
				courseId: z.string()
				// knowledge: z.array(z.string()) TODO not used
			})
		)
		.mutation(async ({ input }) => {
			return await enqueueCourseGraphJob(input.courseId);
		}),
	getCourseGraphJobStatus: authProcedure
		.input(z.object({ jobId: z.string() }))
		.query(async ({ input }) => {
			const job = await database.jobQueue.findUnique({
				where: { id: input.jobId }
			});
			if (!job) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
			}
			return {
				status: job.status,
				cause: job.cause,
				result: job.context ? JSON.parse(job.context) : null
			};
		}),
	createLessonPath: authProcedure
		.input(
			z.object({
				courseId: z.string(),
				knowledge: z.array(z.string())
			})
		)
		.mutation(async ({ input, ctx }) => {
			// TODO any permissions? I think VIEW is enough
			const course = await database.course.findUnique({
				where: { courseId: input.courseId },
				select: {
					version: true,
					type: true,
					provides: {
						select: {
							id: true,
							children: {
								// Needed for nestedSkills
								select: { id: true }
							}
						}
					}
				}
			});
			if (!course) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Failed to find requested course"
				});
			}
			if (course.type !== CourseType.DYNAMIC) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Requested course is not dynamic"
				});
			}

			const userGlobalKnowledge = await database.student.findUnique({
				where: { username: ctx.user.name },
				select: { received: { select: { id: true } } }
			});

			const userGlobalKnowledgeIds = (userGlobalKnowledge?.received ?? []).map(s => s.id);
			const userKnowledge = [...(input.knowledge ?? []), ...userGlobalKnowledgeIds];

			const content = await resolveLessonPath({
				courseProvides: course.provides,
				userKnowledgeIds: userKnowledge
			});

			if (!content) {
				return null;
			}
			const courseChapter: CourseChapter = {
				title: "",
				description: "",
				content: content
			};
			const courseContent: CourseContent = [courseChapter];

			const generatedCourse = await database.generatedLessonPath.create({
				data: {
					content: courseContent,
					courseVersion: course.version,
					slug: randomUUID(),
					courseId: input.courseId,
					meta: createCourseMeta({ content: courseContent }),
					username: ctx.user.name,
					createdAt: new Date(),
					updatedAt: new Date()
				}
			});

			return generatedCourse;
		}),
	getSkillContext: authProcedure
		.input(
			z.object({
				courseId: z.string()
			})
		)
		.query(async ({ input }) => {
			return await getSkillContext(input.courseId);
		}),
	fullExport: t.procedure.input(z.object({ slug: z.string() })).query(async ({ input, ctx }) => {
		const fullExport = await getFullCourseExport(input.slug);

		// Check if content is generally allowed to be exported
		const isOERCompatible = fullExport.lessons.every(
			lesson => lesson.license?.oerCompatible !== false
		);

		// OER-compatible or ADMIN / AUTHOR of the course TODO can edit or FULL?
		if (!isOERCompatible && !(ctx.user && (await canEdit(ctx.user, fullExport.course)))) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message:
					"Content is neither OER-compatible nor the user has edit permission. Export not allowed."
			});
		}

		return fullExport;
	}),
	create: authProcedure.input(courseFormSchema).mutation(async ({ input, ctx }) => {
		// TODO do I need any course type dependent checks here?
		if (input.authors.length <= 0 && ctx.user.role !== "ADMIN") {
			throw new TRPCError({
				code: "FORBIDDEN",
				message:
					"Deleting the last author as is not allowed, except for Admin Users. Contact the side administrator for more information. "
			});
		}
		// check permissions
		if (!(await canCreate(ctx.user))) {
			throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions." });
		}
		// prepare permissions for create (can throw)
		const permissions = await preparePermissionsForCreate(input.permissions);

		const courseForDb = mapCourseFormToInsert(input, getRandomId(), permissions);

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
			const permissions = await prepareResourceUpdate(
				ctx.user,
				input,
				input.course.permissions
			);
			const courseForDb = mapCourseFormToUpdate(input.course, input.courseId, permissions);

			return await database.course.update({
				where: { courseId: input.courseId },
				data: courseForDb,
				select: { title: true, slug: true, courseId: true }
			});
		}),
	deleteCourse: authProcedure
		.input(z.object({ slug: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const resource = await getCourseResource(input.slug);
			if (!(await canDelete(ctx.user, resource))) {
				throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions" });
			}
			return database.course.delete({
				where: { slug: input.slug }
			});
		}),
	findLinkedEntities: authProcedure
		.input(z.object({ courseId: z.string() }))
		.query(async ({ input, ctx }) => {
			if (!(await canEdit(ctx.user, input))) {
				throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions" });
			}
			const course = await database.course.findUnique({
				where: input,
				include: {
					specializations: {
						include: {
							subject: true,
							permissions: {
								select: {
									accessLevel: true,
									groupId: true
								}
							}
						}
					},
					subject: {
						include: {
							permissions: {
								select: {
									accessLevel: true,
									groupId: true
								}
							}
						}
					}
				}
			});
			return course;
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

			if (!(await canEdit(ctx.user, course))) {
				throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions" });
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
		}),
	removeLesson: authProcedure
		.input(z.object({ courseId: z.string(), lessonId: z.string() }))
		.mutation(async ({ input, ctx }) => {
			if (!(await canEdit(ctx.user, { courseId: input.courseId }))) {
				throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions" });
			}
			const course = await database.course.findUniqueOrThrow({
				where: { courseId: input.courseId },
				select: { content: true }
			});
			const content = (course.content ?? []) as CourseContent;
			const newContent = content.map(chapter => ({
				...chapter,
				content: chapter.content.filter(lesson => lesson.lessonId !== input.lessonId)
			}));
			return database.course.update({
				where: { courseId: input.courseId },
				data: { content: newContent },
				select: { courseId: true }
			});
		})
});

/**
 * Gathers required and provided skill ids of the course and its lessons (from default content)
 * @param courseId - id of course to get context for
 * @returns object with course requires and provides, as well as its lessons with requires and provides
 */
async function getSkillContext(courseId: string) {
	const course = await database.course.findUnique({
		where: { courseId },
		select: {
			type: true,
			courseId: true,
			content: true,
			requires: { select: { id: true } },
			provides: { select: { id: true } }
		}
	});
	if (!course) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: `Course not found for id: ${courseId}`
		});
	}

	const lessonIds = extractLessonIds(normalizeContent(course.content));
	const lessons = lessonIds.length
		? await database.lesson.findMany({
				where: { lessonId: { in: lessonIds } },
				select: {
					lessonId: true,
					requires: { select: { id: true } },
					provides: { select: { id: true } }
				}
			})
		: [];

	const flattenSkillId = (skill: { id: string }) => skill.id;

	return {
		type: course.type,
		courseId: course.courseId,
		requires: course.requires.map(flattenSkillId),
		provides: course.provides.map(flattenSkillId),
		lessons: lessons.map(lesson => ({
			lessonId: lesson.lessonId,
			requires: lesson.requires.map(flattenSkillId),
			provides: lesson.provides.map(flattenSkillId)
		}))
	};
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

async function enqueueCourseGraphJob(courseId: string): Promise<string> {
	// get relevant skills for this course (default lesson path)
	const ctx = await getSkillContext(courseId);
	if (ctx.type !== CourseType.DYNAMIC) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "Requested course is not dynamic"
		});
	}

	const ctxSkills = new Set([
		...ctx.requires,
		...ctx.provides,
		...ctx.lessons.flatMap(l => [...l.requires, ...l.provides])
	]);
	if (ctxSkills.size === 0) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "Requested course does not have any skills required and provided"
		});
	}

	// TODO select all skill rows into memory might be expensive in the future
	const allSkills = await database.skill.findMany({
		select: { id: true, children: { select: { id: true } } }
	});
	// as skills form a tree, no way to know that a child can be learned by parent without loading all children skills (do DFS)
	const dfsQueue = [...ctxSkills];
	const skillMap = new Map(allSkills.map(s => [s.id, s]));
	while (dfsQueue.length > 0) {
		const skill = skillMap.get(dfsQueue.pop() as string); // can contain only string, length is checked
		for (const child of skill?.children ?? []) {
			if (!ctxSkills.has(child.id)) {
				ctxSkills.add(child.id);
				dfsQueue.push(child.id);
			}
		}
	}
	const relevantSkills = allSkills
		.filter(s => ctxSkills.has(s.id))
		.map(s => ({
			id: s.id,
			repositoryId: "",
			children: s.children
		}));

	// get relevant learning units (must have at least one skill from ctx)
	const skillIds = [...ctxSkills.keys()];
	// ctx lessons are ignored. If they are valid, they should reappear with this query
	const relevantLessons = await database.lesson.findMany({
		where: {
			OR: [
				{ requires: { some: { id: { in: skillIds } } } },
				{ provides: { some: { id: { in: skillIds } } } }
			]
		},
		select: {
			lessonId: true,
			requires: { select: { id: true } },
			provides: { select: { id: true } }
		}
	});

	const jobId = randomUUID();
	const subscription = workerServiceClient.jobQueue.subscribe(
		{ jobId },
		{
			onData: async event => {
				const result =
					event.status === "finished" ? JSON.stringify(event.result) : undefined;
				await logJobProgress(jobId, event, result);

				if (event.status === "finished" || event.status === "aborted") {
					subscription.unsubscribe();
				}
			},
			onError: async error => {
				console.error("[CourseRouter] Graph job subscription error", {
					jobId,
					courseId,
					error: error instanceof Error ? error.message : String(error)
				});
				await logJobProgress(jobId, {
					type: "courseGraphAnalysis",
					status: "aborted",
					cause: error instanceof Error ? error.message : String(error)
				});
				subscription.unsubscribe();
			}
		}
	);
	await workerServiceClient.submitJob.mutate({
		jobId,
		jobType: "courseGraphAnalysis",
		payload: {
			dbSkills: relevantSkills,
			lessons: relevantLessons
		}
	});

	return jobId;
}
