import { compileMarkdown } from "@self-learning/markdown";
import { z } from "zod";
import { t } from "../trpc";
import { completionRouter } from "./completion.router";
import { courseRouter } from "./course.router";
import { enrollmentRouter } from "./enrollment.router";
import { learningDiaryRouter } from "./learning-diary.router";
import { lessonRouter } from "./lesson.router";

export const appRouter = t.router({
	completion: completionRouter,
	course: courseRouter,
	enrollment: enrollmentRouter,
	learningDiary: learningDiaryRouter,
	lesson: lessonRouter,
	mdx: t.procedure.input(z.string()).mutation(({ input }) => {
		return compileMarkdown(input);
	})
});

// export type definition of API
export type AppRouter = typeof appRouter;
