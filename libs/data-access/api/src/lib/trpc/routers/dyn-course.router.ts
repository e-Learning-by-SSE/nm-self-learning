import { z } from "zod";
import { UserFromSession } from "../context";
import { authorProcedure, authProcedure, isCourseAuthorProcedure, t } from "../trpc";
import { database } from "@self-learning/database";
import {
	CourseChapter,
	CourseContent,
	createCourseMeta,
	dynCourseBasicInfoSchema
} from "@self-learning/types";
import { dynCourseGenPathFormSchema } from "@self-learning/teaching";
import { workerPoolManager } from "@self-learning/api";
import { DefaultCostParameter } from "@e-learning-by-sse/nm-skill-lib";
import {
	emitCourseGenerationError,
	emitCourseGenerationResult
} from "apps/site/pages/api/course-generation-events";
import { randomUUID } from "crypto";

export const dynCourseRouter = t.router({
	getBasicInfo: authorProcedure
		.input(z.object({ slug: z.string() })) // todo: is it slug or courseId?
		.output(dynCourseBasicInfoSchema)
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
	generateDynCourse: authProcedure
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
