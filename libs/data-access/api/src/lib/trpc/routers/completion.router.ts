import { getCourseCompletionOfStudent, markAsCompleted } from "@self-learning/completion";
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
			return getCourseCompletionOfStudent(input.courseSlug, ctx.username);
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
				username: ctx.username
			});
		})
});
