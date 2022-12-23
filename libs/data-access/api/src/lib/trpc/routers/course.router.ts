import { Prisma } from "@prisma/client";
import { database } from "@self-learning/database";
import {
	CourseFormModel,
	courseFormSchema,
	mapCourseFormToInsert,
	mapCourseFormToUpdate
} from "@self-learning/teaching";
import { CourseContent, extractLessonIds, LessonMeta } from "@self-learning/types";
import { getRandomId, paginate, Paginated, paginationSchema } from "@self-learning/util/common";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { authProcedure, t } from "../trpc";

export const courseRouter = t.router({
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
			lessonMap[lesson.lessonId] = lesson as typeof lessons[0] & { meta: LessonMeta };
		}

		return { content, lessonMap };
	}),
	create: authProcedure.input(courseFormSchema).mutation(async ({ input, ctx }) => {
		const courseForDb = mapCourseFormToInsert(input, getRandomId());

		// We check the permissions of the creating user, who might NOT be an author (i.e., admin creating course for someone else)
		const canCreate = await canCreateInSpecialization(
			ctx.user.name,
			input.specializations.map(s => s.specializationId)
		);

		if (!canCreate) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message:
					"Creating a course requires either: admin role | admin of all related subjects | admin of all related specializations"
			});
		}

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

/**
 * User must have permissions for ALL specializations that this course is assigned to:
 * - can be admin of subjects
 * - can be admin of specializations
 */
async function canCreateInSpecialization(
	username: string,
	specializationIds: string[]
): Promise<boolean> {
	const user = await getUserPermissions(username);

	if (user.role === "ADMIN") {
		return true;
	}

	const subjects = await getSubjects(specializationIds);

	const isAdminOfAllSubjects = subjects.every(
		subject => user.author && subject.subjectId in user.author.subjectAdmin
	);

	const isAdminOfAllSpecializations = specializationIds.every(
		specializationId => user.author && specializationId in user.author.specializationAdmin
	);

	return isAdminOfAllSubjects || isAdminOfAllSpecializations;
}

async function canEditCourse(
	username: string,
	courseId: string,
	course: CourseFormModel
): Promise<boolean> {
	const user = await getUserPermissions(username);

	if (user.role === "ADMIN") {
		return true;
	}

	const subjects = await getSubjects(course.specializations.map(s => s.specializationId));

	return false;
}

async function getSubjects(specializationIds: string[]) {
	return await database.specialization.findMany({
		where: { specializationId: { in: specializationIds } }
	});
}

function getUserPermissions(username: string) {
	return database.user.findUniqueOrThrow({
		where: { name: username },
		select: {
			role: true,
			author: {
				select: {
					subjectAdmin: {
						select: {
							subjectId: true
						}
					},
					specializationAdmin: {
						select: {
							specializationId: true
						}
					}
				}
			}
		}
	});
}
