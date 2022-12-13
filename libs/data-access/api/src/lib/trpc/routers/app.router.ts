import { compileMarkdown } from "@self-learning/markdown";
import { z } from "zod";
import { t } from "../trpc";
import { authorRouter } from "./author.router";
import { completionRouter } from "./completion.router";
import { courseRouter } from "./course.router";
import { enrollmentRouter } from "./enrollment.router";
import { learningDiaryRouter } from "./learning-diary.router";
import { lessonRouter } from "./lesson.router";
import { meRouter } from "./me.router";
import { programmingRouter } from "./programming";
import { specializationRouter } from "./specialization.router";
import { storageRouter } from "./storage.router";
import { subjectRouter } from "./subject.router";

export const appRouter = t.router({
	author: authorRouter,
	completion: completionRouter,
	course: courseRouter,
	enrollment: enrollmentRouter,
	learningDiary: learningDiaryRouter,
	lesson: lessonRouter,
	me: meRouter,
	storage: storageRouter,
	specialization: specializationRouter,
	subject: subjectRouter,
	programming: programmingRouter,
	mdx: t.procedure
		.input(z.object({ text: z.string().nullable().optional() }))
		.mutation(({ input }) => {
			return compileMarkdown(input.text ?? "");
		})
});

// export type definition of API
export type AppRouter = typeof appRouter;
