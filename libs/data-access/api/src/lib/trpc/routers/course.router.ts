import { Prisma } from "@prisma/client";
import { database } from "@self-learning/database";
import {
	dynCourseFormSchema,
	courseFormSchema,
	getFullCourseExport,
	mapCourseFormToInsert,
	mapCourseFormToUpdate,
	mapRelaxedCourseFormToInsert,
	mapRelaxedCourseFormToUpdate,
	relaxedCourseFormSchema as relaxedCourseFormSchema
} from "@self-learning/teaching";
import {
	CourseChapter,
	CourseContent,
	CourseMeta,
	createCourseMeta,
	extractLessonIds,
	LessonMeta
} from "@self-learning/types";
import { getRandomId, paginate, Paginated, paginationSchema } from "@self-learning/util/common";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { authorProcedure, authProcedure, isCourseAuthorProcedure, t } from "../trpc";
import { UserFromSession } from "../context";
import {
	And,
	CompositeUnit,
	DefaultCostParameter,
	Empty,
	getPath,
	isCompositeGuard,
	LearningUnit as LibLearningUnit,
	Unit,
	Variable,
	Skill as LibSkill
} from "@e-learning-by-sse/nm-skill-lib";
import { randomUUID } from "crypto";

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

			const whereCourse: Prisma.CourseWhereInput = {
				title:
					input.title && input.title.length > 0
						? { contains: input.title, mode: "insensitive" }
						: undefined,
				specializations: input.specializationId
					? { some: { specializationId: input.specializationId } }
					: undefined,
				authors: input.authorId ? { some: { username: input.authorId } } : undefined
			};

			const whereDynCourse: Prisma.DynCourseWhereInput = {
				title:
					input.title && input.title.length > 0
						? { contains: input.title, mode: "insensitive" }
						: undefined,
				specializations: input.specializationId
					? { some: { specializationId: input.specializationId } }
					: undefined,
				authors: input.authorId ? { some: { username: input.authorId } } : undefined
			};

			const course = await database.course.findMany({
				select: {
					slug: true,
					title: true
				},
				...paginate(pageSize, input.page),
				orderBy: { title: "asc" },
				where: whereCourse
			});

			const dynCourse = await database.dynCourse.findMany({
				select: {
					slug: true,
					title: true
				},
				...paginate(pageSize, input.page),
				orderBy: { title: "asc" },
				where: whereDynCourse
			});

			const result = [...course, ...dynCourse].sort((a, b) => a.title.localeCompare(b.title));

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

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const where: any = {
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

			const [resultCourse, countCourse] = await database.$transaction([
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

			const [resultDynCourse, countDynCourse] = await database.$transaction([
				database.dynCourse.findMany({
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

			const result = [...resultCourse, ...resultDynCourse].sort((a, b) =>
				a.title.localeCompare(b.title)
			);

			const count = countCourse + countDynCourse;

			return {
				result,
				pageSize: pageSize,
				page: input.page,
				totalCount: count
			} satisfies Paginated<unknown>;
		}),
	getContent: authProcedure
		.input(z.object({ slug: z.string() }))
		.query(async ({ input, ctx }) => {
			let course = await database.course.findUnique({
				where: { slug: input.slug },
				select: {
					courseId: true,
					content: true
				}
			});

			if (!course) {
				const dynCourse = await database.dynCourse.findUniqueOrThrow({
					where: { slug: input.slug },
					select: {
						courseId: true,
						generatedLessonPaths: {
							where: {
								username: ctx.user.name
							},
							select: {
								content: true
							}
						}
					}
				});

				course = {
					...dynCourse,
					content: dynCourse.generatedLessonPaths[0]?.content ?? []
				};
			}

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
	// ----------- 391 ---------------------------------------------
	generateDynCourse: authProcedure
		.input(
			z.object({
				courseId: z.string(),
				knowledge: z.array(z.string())
			})
		)
		.mutation(async ({ input, ctx }) => {
			const course = await database.dynCourse.findUniqueOrThrow({
				where: { courseId: input.courseId },
				select: {
					courseVersion: true,
					teachingGoals: {
						select: {
							id: true,
							//repositoryId: true,
							children: {
								// Needed for nestedSkills
								select: { id: true }
							}
						}
					}
				}
			});

			const dbSkills = await database.skill.findMany({
				select: {
					id: true,
					//repositoryId: true,
					children: {
						select: { id: true }
					}
				}
			});

			const userGlobalKnowledge = await database.student.findUnique({
				where: { username: ctx.user.name },
				select: {
					received: {
						select: {
							id: true
						}
					}
				}
			});

			const userGlobalKnowledgeIds =
				userGlobalKnowledge?.received.map(skill => skill.id) ?? [];

			const userKnowledge = [...input.knowledge, ...userGlobalKnowledgeIds];

			const libSkills: LibSkill[] = dbSkills.map(skill => ({
				id: skill.id,
				//repositoryId: skill.repositoryId,
				children: skill.children.map(child => child.id)
			}));

			const findSkill = (id: string) => libSkills.find(skill => skill.id === id);

			const goalLibSkills: LibSkill[] = course.teachingGoals.map(goal => ({
				id: goal.id,
				//repositoryId: goal.repositoryId,
				children: goal.children.map(child => child.id)
			}));

			const knowledgeLibSkills: LibSkill[] = userKnowledge
				.map(skillId => findSkill(skillId))
				.filter((skill): skill is LibSkill => !!skill);

			const lessons = await database.lesson.findMany({
				select: {
					lessonId: true,
					requires: {
						select: {
							id: true
						}
					},
					provides: {
						select: {
							id: true
						}
					}
				}
			});

			const convertToExpression = (skillIds?: string[]): And | Empty => {
				if (!skillIds || skillIds.length === 0) {
					return new Empty();
				}
				const skills = skillIds
					.map(id => findSkill(id))
					.filter((s): s is LibSkill => s !== undefined);

				if (skills.length === 0) {
					return new Empty();
				}
				const variables = skills.map(skill => new Variable(skill));
				return new And(variables);
			};

			const learningUnits: LibLearningUnit[] = lessons.map(lesson => ({
				id: lesson.lessonId,
				requires: convertToExpression(lesson.requires.map(req => req.id)),
				provides: lesson.provides
					.map(tg => findSkill(tg.id))
					.filter((s): s is LibSkill => s !== undefined),
				suggestedSkills: []
			}));

			const guard: isCompositeGuard<LibLearningUnit> = (
				element: Unit<LibLearningUnit>
			): element is CompositeUnit<LibLearningUnit> => {
				return false;
			};

			const fnCost = () => 1;
			console.log(
				"[courseRouter.generateCoursePreview]: Generating course preview for",
				ctx.user.name,
				"for courseId",
				input.courseId
			);
			console.log(
				"[courseRouter.generateCoursePreview]: Using knowledge skills",
				input.knowledge,
				"and goal skills",
				course.teachingGoals.map(goal => goal.id)
			);
			console.log(
				"[courseRouter.generateCoursePreview]: Using libSkills",
				libSkills.map(skill => skill.id)
			);
			console.log(
				"[courseRouter.generateCoursePreview]: Using learningUnits",
				learningUnits.map(unit => unit.id)
			);
			console.log(
				"[courseRouter.generateCoursePreview]: Using goalLibSkills",
				goalLibSkills.map(skill => skill.id)
			);
			console.log(
				"[courseRouter.generateCoursePreview]: Using knowledgeLibSkills",
				knowledgeLibSkills.map(skill => skill.id)
			);

			const path = getPath({
				skills: libSkills,
				learningUnits: learningUnits,
				goal: goalLibSkills,
				knowledge: knowledgeLibSkills,
				fnCost: fnCost,
				isComposite: guard,
				costOptions: DefaultCostParameter
			});

			const courseChapter = [
				{
					title: "",
					description: "",
					content: path?.path.map(unit => ({
						lessonId: unit.origin?.id ?? ""
					}))
				} as CourseChapter
			];

			const courseContent: CourseContent = courseChapter;

			const generatedCourse = database.generatedLessonPath.create({
				data: {
					content: courseContent,
					courseVersion: course.courseVersion,
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
	createDynamic: authorProcedure.input(dynCourseFormSchema).mutation(async ({ input, ctx }) => {
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

		const created = await database.dynCourse.create({
			data: {
				...input,
				courseId: crypto.randomUUID(),
				slug: input.slug,
				courseVersion: Date.now().toString(),
				subjectId: input.subjectId ?? undefined,
				meta: {},
				authors: {
					connect: input.authors.map(author => ({ username: author.username }))
				},
				teachingGoals: {
					connect: input.teachingGoals.map(goal => ({
						name: goal.name,
						description: goal.description,
						//repositoryId: goal.repositoryId,
						id: goal.id
					}))
				}
			},
			select: {
				title: true,
				slug: true,
				courseId: true
			}
		});

		console.log("[courseRouter.createDynamic]: Course created by", ctx.user.name, created);
		return created;
	}),
	editDynamic: isCourseAuthorProcedure
		.input(
			z.object({
				courseId: z.string(),
				course: dynCourseFormSchema
			})
		)
		.mutation(async ({ input, ctx }) => {
			// This directive is used here to intentionally ignore the "unused variable" warning from ESLint.
			// In this case, the variable is required by the function signature (e.g., for destructuring or API compatibility),
			// but is not actually used in the function body. Disabling the rule prevents unnecessary lint errors.
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { courseId, ...updateData } = input.course;
			const updated = await database.dynCourse.update({
				where: { courseId: input.courseId },
				data: {
					...updateData,
					courseVersion: Date.now().toString(),
					slug: updateData.slug,
					meta: {},
					authors: {
						connect: updateData.authors.map(author => ({ username: author.username }))
					},
					teachingGoals: {
						connect: updateData.teachingGoals.map(goal => ({
							name: goal.name,
							description: goal.description,
							//repositoryId: goal.repositoryId,
							id: goal.id
						}))
					}
				},
				select: {
					title: true,
					slug: true,
					courseId: true
				}
			});

			console.log("[courseRouter.editDynamic]: Course updated by", ctx.user?.name, updated);
			return updated;
		}),

	// -----------------------------------------------------------

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

		input.authors = [...input.authors, { username: ctx.user.name }];
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
		if (!ctx.user.isAuthor) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Creating a course requires user to be an author"
			});
		}

		input.authors = [...input.authors, { username: ctx.user.name }];
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
	editMinimal: authorProcedure
		.input(
			z.object({
				slug: z.string(),
				course: relaxedCourseFormSchema
			})
		)
		.mutation(async ({ input, ctx }) => {
			const courseForDb = mapRelaxedCourseFormToUpdate(input.course, input.slug);

			const updated = await database.course.update({
				where: { slug: input.slug },
				data: {
					...courseForDb
				},
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
