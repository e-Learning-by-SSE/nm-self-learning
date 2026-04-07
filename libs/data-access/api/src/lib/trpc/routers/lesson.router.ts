import { AccessLevel, Course, Prisma } from "@prisma/client";
import { database, save_subtitle_for_lesson } from "@self-learning/database";
import {
	createLessonMeta,
	EventTypeMap,
	lessonSchema,
	subtitleSrcSchema
} from "@self-learning/types";
import { getRandomId, paginate, Paginated, paginationSchema } from "@self-learning/util/common";
import { differenceInHours } from "date-fns";
import { z } from "zod";
import { authorProcedure, authProcedure, t } from "../trpc";
import { TRPCError } from "@trpc/server";
import { greaterAccessLevel, greaterOrEqAccessLevel } from "../../permissions/permission.utils";
import { getEffectiveAccess } from "../../permissions/permission.service";
import { canCreate, canDelete } from "../../permissions/lesson.utils";

const saveSubtitleInputSchema = z.object({
	lessonId: z.string(),
	video_url: z.url(),
	transcription: subtitleSrcSchema
});

export const lessonRouter = t.router({
	findOneAllProps: authProcedure.input(z.object({ lessonId: z.string() })).query(({ input }) => {
		return database.lesson.findUniqueOrThrow({
			where: { lessonId: input.lessonId },
			include: {
				authors: { select: { username: true } },
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
	findOneBySlug: authProcedure
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
				result: z.array(
					z.object({
						lessonId: z.string(),
						title: z.string(),
						slug: z.string(),
						updatedAt: z.date(),
						authors: z.array(
							z.object({
								displayName: z.string(),
								slug: z.string(),
								imgUrl: z.string().nullable()
							})
						)
					})
				),
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
				result: lessons,
				pageSize: actualPageSize,
				page: page,
				totalCount: count
			};
		}),
	getMyLessons: authProcedure
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

			const where: Prisma.LessonWhereInput = {
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
				database.lesson.findMany({
					select: {
						slug: true,
						title: true,
						lessonId: true,
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
				database.lesson.count({ where })
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
	create: authProcedure.input(lessonSchema).mutation(async ({ input, ctx }) => {
		// make sure at least one permission is FULL
		if (input.permissions.filter(p => p.accessLevel === AccessLevel.FULL).length === 0) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "requires at least one FULL permission."
			});
		}
		// can create if user is a member of at least one group
		if (!(await canCreate(ctx.user))) {
			throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions." });
		}
		const createdLesson = await database.lesson.create({
			data: {
				...input,
				quiz: input.quiz ? (input.quiz as Prisma.JsonObject) : Prisma.JsonNull,
				authors: { connect: input.authors.map(a => ({ username: a.username })) },
				licenseId: input.licenseId,
				requires: { connect: input.requires.map(r => ({ id: r.id })) },
				provides: { connect: input.provides.map(r => ({ id: r.id })) },
				content: input.content as Prisma.InputJsonArray,
				lessonId: getRandomId(),
				meta: createLessonMeta(input) as unknown as Prisma.JsonObject,
				permissions: {
					create: input.permissions.map(p => ({
						accessLevel: p.accessLevel,
						groupId: p.groupId
					}))
				}
			},
			select: { lessonId: true, slug: true, title: true }
		});

		console.log("[lessonRouter.create]: Lesson created by", ctx.user.name, createdLesson);
		return createdLesson;
	}),
	edit: authProcedure
		.input(z.object({ lessonId: z.string(), lesson: lessonSchema }))
		.mutation(async ({ input, ctx }) => {
			// get user access level to resource - must be at least EDIT
			const { accessLevel: actualAccess } = await getEffectiveAccess(ctx.user, {
				lessonId: input.lessonId
			});
			if (!actualAccess || !greaterOrEqAccessLevel(actualAccess, AccessLevel.EDIT)) {
				throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions" });
			}
			// drop display fields
			const perms = input.lesson.permissions.map(p => {
				return {
					accessLevel: p.accessLevel,
					groupId: p.groupId
				};
			});
			// make sure at least one permission is FULL
			if (perms.filter(p => p.accessLevel === AccessLevel.FULL).length === 0) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "requires at least one FULL permission."
				});
			}
			// fetch existing permissions to determine diffs
			const existingPerms = await database.permission.findMany({
				where: { lessonId: input.lessonId },
				select: { groupId: true, accessLevel: true }
			});
			// compute if premissions are equal
			type Permission = {
				groupId: number;
				accessLevel: AccessLevel;
			};
			const toKey = (p: Permission) => `${p.groupId}|${p.accessLevel}`;
			const keys = new Set(perms.map(toKey));
			const equal =
				existingPerms.length === perms.length &&
				existingPerms.every(ep => keys.has(toKey(ep)));
			//
			if (!equal) {
				// must have FULL access in the resource to change permissions
				if (!greaterOrEqAccessLevel(actualAccess, AccessLevel.FULL)) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "Insufficient permissions to update permissions"
					});
				}
			}
			// update
			const updatedLesson = await database.lesson.update({
				where: { lessonId: input.lessonId },
				data: {
					...input.lesson,
					quiz: input.lesson.quiz
						? (input.lesson.quiz as Prisma.JsonObject)
						: Prisma.JsonNull,
					lessonId: input.lessonId,
					authors: { set: input.lesson.authors.map(a => ({ username: a.username })) },
					licenseId: input.lesson.licenseId,
					requires: { set: input.lesson.requires.map(r => ({ id: r.id })) },
					provides: { set: input.lesson.provides.map(r => ({ id: r.id })) },
					meta: createLessonMeta(input.lesson) as unknown as Prisma.JsonObject,
					permissions: {
						deleteMany: { groupId: { notIn: perms.map(p => p.groupId) } },
						upsert: perms.map(p => ({
							where: {
								groupId_lessonId: { lessonId: input.lessonId, groupId: p.groupId }
							},
							create: p,
							update: {
								accessLevel: p.accessLevel
							}
						}))
					}
				},
				select: { lessonId: true, slug: true, title: true }
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
									   CROSS JOIN jsonb_array_elements(chapter->'content') AS lesson
							  WHERE lesson ->>'lessonId' = ${input.lessonId})
			`;
			return courses as Course[];
		}),
	deleteLesson: authProcedure
		.input(z.object({ lessonId: z.string() }))
		.mutation(async ({ input, ctx }) => {
			if (!(await canDelete(ctx.user, input.lessonId))) {
				throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions." });
			}
			return await database.lesson.delete({ where: { lessonId: input.lessonId } });
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
		}),

	validateAttempt: authProcedure
		.input(
			z.object({
				lessonId: z.string(),
				lessonAttemptId: z.string()
			})
		)
		.query(async ({ input, ctx }) => {
			const data = await database.eventLog.findFirst({
				where: {
					username: ctx.user.name,
					type: "LESSON_OPEN",
					resourceId: input.lessonId
				},
				orderBy: { createdAt: "desc" },
				select: { createdAt: true, payload: true }
			});

			if (!data) {
				return { isValid: false, reason: "NO_OPEN_EVENT" };
			}

			const latestOpenEvent = {
				...data,
				payload: data.payload as EventTypeMap["LESSON_OPEN"]
			};

			const eventAttemptId = latestOpenEvent.payload.lessonAttemptId;

			// Falls attemptId im Event gespeichert ist, vergleiche
			if (eventAttemptId && eventAttemptId !== input.lessonAttemptId) {
				return { isValid: false, reason: "STALE_ATTEMPT" };
			}

			// Falls das LESSON_OPEN Event älter als 2h ist, ungültig
			const hoursSinceOpen = differenceInHours(new Date(), latestOpenEvent.createdAt);
			if (hoursSinceOpen > 2) {
				return { isValid: false, reason: "EXPIRED" };
			}

			return { isValid: true };
		}),
	save_subtitle: authProcedure
		.meta({
			openapi: {
				enabled: true,
				method: "POST",
				path: "/lessons/save_subtitle",
				tags: ["Lessons"],
				protect: true,
				summary: "Store externally generated subtitles for a lesson"
			}
		})
		.input(saveSubtitleInputSchema)
		.output(
			z.object({
				message: z.string()
			})
		)
		.mutation(async ({ input }) => {
			const { lessonId, video_url, transcription } = input;
			const subtitleSrc = subtitleSrcSchema.parse(transcription);
			try {
				await save_subtitle_for_lesson(lessonId, video_url, subtitleSrc);
				return { message: "Subtitle saved" };
			} catch (error) {
				if (error instanceof Error) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: error.message
					});
				} else {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "An unknown error occurred"
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
		authors: authorName ? { some: { username: authorName } } : undefined
	};

	const [lessons, count] = await database.$transaction([
		database.lesson.findMany({
			select: {
				lessonId: true,
				title: true,
				slug: true,
				updatedAt: true,
				authors: { select: { displayName: true, slug: true, imgUrl: true } }
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
