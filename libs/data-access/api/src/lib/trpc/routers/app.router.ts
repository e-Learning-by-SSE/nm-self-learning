import { completionRouter } from "./completion.router";
import { createRouter } from "../create-router";
import { enrollmentRouter } from "./enrollment.router";
import { lessonRouter } from "./lesson.router";
import { courseRouter } from "./course.router";
import { z } from "zod";
import { compileMarkdown } from "@self-learning/markdown";
import { learningDiaryRouter } from "./learning-diary.router";

export const appRouter = createRouter()
	.merge("user-completion.", completionRouter)
	.merge("user-enrollments.", enrollmentRouter)
	.merge("courses.", courseRouter)
	.merge("lessons.", lessonRouter)
	.merge("learning-diary.", learningDiaryRouter)
	.mutation("mdx", {
		input: z.object({
			text: z.string()
		}),
		resolve({ input }) {
			return compileMarkdown(input.text);
		}
	});

/** Contains type definitions of the api. */
export type AppRouter = typeof appRouter;
