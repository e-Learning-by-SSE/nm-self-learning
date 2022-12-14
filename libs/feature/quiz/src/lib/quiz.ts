import { quizContentSchema } from "@self-learning/question-types";
import { z } from "zod";

export const quizConfigSchema = z.object({
	hints: z.object({
		enabled: z.boolean(),
		maxHints: z.number().int().positive()
	}),
	maxErrors: z.number().int().positive(),
	showSolution: z.boolean()
});

export const quizSchema = z.object({
	questions: z.array(quizContentSchema),
	config: quizConfigSchema
});

export type QuizConfig = z.infer<typeof quizConfigSchema>;
export type Quiz = z.infer<typeof quizSchema>;
