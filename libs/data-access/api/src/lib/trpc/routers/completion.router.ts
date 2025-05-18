import { getCourseCompletionOfStudent, markAsCompleted } from "@self-learning/completion";
import { database } from "@self-learning/database";
import { z } from "zod";
import { authProcedure, t } from "../trpc";

export const completionRouter = t.router({
	getCourseCompletion: authProcedure
		.input(
			z.object({
				courseSlug: z.string()
			})
		)
		.query(async ({ input, ctx }) => {
			return getCourseCompletionOfStudent(input.courseSlug, ctx.user.name);
		}),
	markAsCompleted: authProcedure
		.input(
			z.object({
				lessonId: z.string(),
				courseSlug: z.string().nullable()
			})
		)
		.mutation(async ({ input, ctx }) => {
			return markAsCompleted({
				lessonId: input.lessonId,
				courseSlug: input.courseSlug,
				username: ctx.user.name
			});
		}),
	lessonGrading: authProcedure
		.input(
			z.object({
				lessonId: z.string(),
				averageScore: z.number()
			})
		)
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.user.id;
			const { lessonId, averageScore } = input;

			// Fetch the existing score
			const existingPerformance = await database.lessonPerformance.findUnique({
				where: {
					userId_lessonId: {
						userId,
						lessonId
					}
				},
				select: {
					score: true
				}
			});

			// Only update if the new score is better
			if (!existingPerformance || averageScore > existingPerformance.score) {
				return await database.lessonPerformance.upsert({
					where: {
						userId_lessonId: {
							userId,
							lessonId
						}
					},
					create: {
						userId,
						lessonId,
						score: averageScore,
						completedAt: new Date()
					},
					update: {
						score: averageScore,
						completedAt: new Date()
					},
					select: {
						id: true,
						score: true,
						completedAt: true
					}
				});
			}

			// If the new score is not better, return the existing performance
			return existingPerformance;
		})
});
