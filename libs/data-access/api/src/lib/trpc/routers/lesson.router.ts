import { AccessLevel, Course, GroupRole, Prisma } from "@prisma/client";
import { database } from "@self-learning/database";
import { createLessonMeta, lessonSchema } from "@self-learning/types";
import { getRandomId, paginate, Paginated, paginationSchema } from "@self-learning/util/common";
import { z } from "zod";
import { authorProcedure, authProcedure, t } from "../trpc";
import { TRPCError } from "@trpc/server";
import {
	getUserPermission,
	greaterOrEqAccessLevel,
	hasGroupRole,
	hasResourceAccess
} from "./permission.router";
import { UserFromSession } from "../context";

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
		// make sure at least one permission is FULL
		if (input.permissions.filter(p => p.accessLevel === AccessLevel.FULL).length > 0) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "requires at least one FULL permission."
			});
		}
		// can create if user is a member of at least one group
		const canCreate = await database.member.findFirst({
			where: {
				userId: ctx.user.id
			}
		});
		if (!canCreate) {
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
			const { accessLevel: actualAccess } = await getUserPermission({
				userId: ctx.user.id,
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
			if (perms.filter(p => p.accessLevel === AccessLevel.FULL).length > 0) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "requires at least one FULL permission."
				});
			}
			// fetch existing permissions to delermine diffs
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
									   CROSS JOIN jsonb_array_elements(chapter -> 'content') AS lesson
							  WHERE lesson->>'lessonId' = ${input.lessonId})
			`;
			return courses as Course[];
		}),
	deleteLesson: authProcedure
		.input(z.object({ lessonId: z.string() }))
		.mutation(async ({ input, ctx }) => {
			if (!(await canEdit(ctx.user, input.lessonId))) {
				throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions." });
			}
			return await database.lesson.delete({ where: { lessonId: input.lessonId } });
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

async function canCreate(user: UserFromSession, groupId: number): Promise<boolean> {
	if (user.role === "ADMIN") return true;
	return await hasGroupRole(groupId, user.id, GroupRole.MEMBER);
}

async function canEdit(user: UserFromSession, lessonId: string): Promise<boolean> {
	if (user.role === "ADMIN") return true;
	return await hasResourceAccess({ userId: user.id, lessonId, accessLevel: AccessLevel.EDIT });
}
