// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { getCourseCompletionOfStudent, markAsCompleted } from "@self-learning/completion";
import { z } from "zod";
import { createProtectedRouter } from "../create-router";

export const completionRouter = createProtectedRouter()
	.query("getCourseCompletion", {
		input: z.object({
			courseSlug: z.string()
		}),
		resolve({ input, ctx }) {
			return getCourseCompletionOfStudent(input.courseSlug, ctx.username);
		}
	})
	.mutation("markAsCompleted", {
		input: z.object({
			lessonId: z.string()
		}),
		resolve({ input, ctx }) {
			return markAsCompleted({
				lessonId: input.lessonId,
				username: ctx.username
			});
		}
	});
