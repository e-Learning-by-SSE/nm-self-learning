import { z } from "zod";
import { UserFromSession } from "../context";
import { authorProcedure, authProcedure, isCourseAuthorProcedure, t } from "../trpc";
import { database } from "@self-learning/database";
import {
	CourseChapter,
	CourseContent,
	createCourseMeta,
	dynCourseFormSchema,
	dynCourseGenPathFormSchema
} from "@self-learning/types";
//import { dynCourseFormSchema, dynCourseGenPathFormSchema } from "@self-learning/teaching";
import { workerPoolManager } from "@self-learning/api";
import { DefaultCostParameter } from "@e-learning-by-sse/nm-skill-lib";
import {
	emitCourseGenerationError,
	emitCourseGenerationResult
} from "apps/site/pages/api/course-generation-events";
import { randomUUID } from "crypto";
import { TRPCError } from "@trpc/server";

export const dynCourseRouter = t.router({
	create: authorProcedure.input(dynCourseFormSchema).mutation(async ({ input, ctx }) => {
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

		const course = await database.dynCourse.create({
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
						id: goal.id
					}))
				},
				requirements: {
					connect: input.requirements.map(skill => ({
						name: skill.name,
						description: skill.description,
						id: skill.id
					}))
				}
			},
			select: {
				title: true,
				slug: true,
				courseId: true
			}
		});

		console.log("[courseRouter.createDynamic]: Course created by", ctx.user.name, course);
		return course;
	}),
	edit: isCourseAuthorProcedure
		.input(
			z.object({
				courseId: z.string(),
				course: dynCourseFormSchema,
				skillsChanged: z.boolean()
			})
		)
		.mutation(async ({ input, ctx }) => {
			const { courseId, skillsChanged } = input;
			const updateData = input.course;

			const prismaUpdateData: any = {
				...updateData,
				slug: updateData.slug,
				meta: {},

				authors: {
					set: [],
					connect: updateData.authors.map(author => ({
						username: author.username
					}))
				},
				teachingGoals: {
					set: updateData.teachingGoals.map(goal => ({ id: goal.id }))
				},
				requirements: {
					set: updateData.requirements.map(skill => ({ id: skill.id }))
				}
			};

			if (skillsChanged) {
				prismaUpdateData.courseVersion = Date.now().toString();
			}

			const updatedCourse = await database.dynCourse.update({
				where: { courseId: courseId ?? "" },
				data: prismaUpdateData,
				select: {
					title: true,
					slug: true,
					courseId: true
				}
			});

			console.log(
				"[courseRouter.editDynamic]: Course updated by",
				ctx.user?.name,
				"skillsChanged:",
				skillsChanged,
				updatedCourse
			);

			return updatedCourse;
		}),
	getBasicInfo: authorProcedure
		.input(z.object({ slug: z.string() })) // todo: is it slug or courseId?
		.output(dynCourseFormSchema)
		.query(async ({ input }) => {
			const course = await database.dynCourse.findUniqueOrThrow({
				where: { slug: input.slug },
				include: {
					authors: true,
					teachingGoals: {
						include: {
							children: true,
							parents: true
						}
					},
					requirements: {
						include: {
							children: true,
							parents: true
						}
					},
					specializations: true,
					generatedLessonPaths: true
				}
			});
			return {
				courseId: course.courseId,
				subjectId: course.subjectId,
				slug: course.slug,
				title: course.title,
				subtitle: course.subtitle,
				description: course.description,
				imgUrl: course.imgUrl,
				authors: course.authors.map(a => ({
					username: a.username,
					displayName: a.displayName ?? "",
					imgUrl: a.imgUrl,
					slug: a.slug
				})),
				teachingGoals: course.teachingGoals.map(goal => ({
					id: goal.id,
					name: goal.name,
					description: goal.description,
					authorId: goal.authorId,
					children: goal.children.map(c => c.id),
					parents: goal.parents.map(p => p.id)
				})),
				requirements: course.requirements.map(req => ({
					id: req.id,
					name: req.name,
					description: req.description,
					authorId: req.authorId,
					children: req.children.map(c => c.id),
					parents: req.parents.map(p => p.id)
				})),
				createdAt: course.createdAt,
				updatedAt: course.updatedAt,
				generatedLessonPaths: course.generatedLessonPaths.map(glp => ({
					courseId: glp.courseId,
					lessonPathId: glp.lessonPathId
				})),
				courseVersion: course.courseVersion
			};
		}),
	getCourse: authorProcedure
		.input(z.object({ slug: z.string() }))
		.output(dynCourseGenPathFormSchema)
		.query(async ({ input }) => {
			const course = await database.dynCourse.findUniqueOrThrow({
				where: { slug: input.slug },
				include: {
					authors: true,
					teachingGoals: {
						include: {
							children: true,
							parents: true
						}
					},
					requirements: {
						include: {
							children: true,
							parents: true
						}
					},
					specializations: true,
					generatedLessonPaths: true
				}
			});

			return {
				courseId: course.courseId,
				subjectId: course.subjectId,
				slug: course.slug,
				title: course.title,
				subtitle: course.subtitle,
				description: course.description,
				imgUrl: course.imgUrl,
				authors: course.authors.map(a => ({
					username: a.username,
					displayName: a.displayName ?? "",
					imgUrl: a.imgUrl,
					slug: a.slug
				})),
				teachingGoals: course.teachingGoals.map(goal => ({
					id: goal.id,
					name: goal.name,
					description: goal.description,
					authorId: goal.authorId,
					children: goal.children.map(c => c.id),
					parents: goal.parents.map(p => p.id)
				})),
				requirements: course.requirements.map(req => ({
					id: req.id,
					name: req.name,
					description: req.description,
					authorId: req.authorId,
					children: req.children.map(c => c.id),
					parents: req.parents.map(p => p.id)
				})),
				createdAt: course.createdAt,
				updatedAt: course.updatedAt,
				generatedLessonPaths: course.generatedLessonPaths.map(glp => ({
					courseId: glp.courseId,
					lessonPathId: glp.lessonPathId
				})),
				courseVersion: course.courseVersion
			};
		}),
	getNewestLessonPath: authProcedure
		.input(
			z.object({
				courseId: z.string()
			})
		)
		.query(async ({ input, ctx }) => {
			const { courseId } = input;
			const username = ctx.user.name;

			const path = await database.generatedLessonPath.findFirst({
				where: { courseId, username },
				orderBy: {
					createdAt: "desc"
				}
			});

			return path;
		}),
	createNewLessonPath: authProcedure
		.input(
			z.object({
				courseId: z.string(),
				knowledge: z.array(z.string())
			})
		)
		.mutation(async ({ input, ctx }) => {
			const generationId = randomUUID();

			/* Run the generation in the background
				 The result will be sent via SSE.*/
			const run = async () => {
				try {
					const course = await database.dynCourse.findUniqueOrThrow({
						where: { courseId: input.courseId },
						select: {
							courseVersion: true,
							teachingGoals: {
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

					const dbSkills = await database.skill.findMany({
						select: {
							id: true,
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

					const lessons = (
						await database.lesson.findMany({
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
						})
					).map(lesson => ({
						...lesson,
						requires: lesson.requires ?? [],
						provides: lesson.provides ?? []
					}));

					const pool = workerPoolManager.getPathGenerationPool();

					const pathResult = (await pool.runTask({
						type: "generatePath",
						payload: {
							dbSkills,
							userGlobalKnowledge: userGlobalKnowledge?.received ?? [],
							course: {
								...course,
								teachingGoals: course.teachingGoals ?? []
							},
							lessons,
							knowledge: input.knowledge,
							costOptions: DefaultCostParameter
						}
					})) as { path: Array<{ origin: { id: string } }> } | null;

					if (!pathResult || !pathResult.path) {
						throw new Error("Path generation failed.");
					}

					const courseChapter = [
						{
							title: "Generated Course Content",
							description:
								"AI-generated learning path based on your current knowledge and learning goals.",
							content: pathResult.path.map(unit => ({
								lessonId: unit.origin?.id ?? ""
							}))
						} as CourseChapter
					];

					const courseContent: CourseContent = courseChapter;

					const generatedCourse = await database.generatedLessonPath.create({
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

					emitCourseGenerationResult(generationId, { slug: generatedCourse.slug }, 500);
				} catch (err) {
					console.error(`[Course Generation] Error for ${generationId}:`, err);
					const error = err as Error;
					emitCourseGenerationError(generationId, {
						message: error.message ?? "Unknown error"
					});
				}
			};

			run();

			return { generationId };
		})
});

// TODO: this is double code
function canCreate(user: UserFromSession): boolean {
	return user.role === "ADMIN" || user.isAuthor;
}
