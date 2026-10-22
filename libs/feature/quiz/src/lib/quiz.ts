import { quizContentSchema } from "@self-learning/question-types";
import { z } from "zod";

export const configSchema = z.object({
	hints: z.object({
		/**
		 * If `false`, hints will be disabled for the entire quiz.
		 * @default true
		 */
		enabled: z.boolean(),
		/**
		 * Max. number of hints that student may use across the entire quiz.
		 * @default 100
		 */
		maxHints: z.number().int().positive()
	}),
	/**
	 * Max. number of questions that student may fail in a quiz.
	 * @default 0
	 */
	maxErrors: z.number().int().positive(),
	/**
	 *  If `true`, students will be shown the correct answer to incorrectly answered questions.
	 * @default false
	 */
	showSolution: z.boolean()
});

export const quizSchema = z
	.object({
		questions: z.array(quizContentSchema),
		questionOrder: z.array(z.string()).default([]),
		config: configSchema.nullable().optional()
	})
	.refine(quiz => quiz.questions.length === 0 || quiz.questionOrder.length > 0, {
		path: ["questionOrder"],
		message: "A question order is required when questions are present"
	});

export type QuizConfig = z.infer<typeof configSchema>;
export type Quiz = z.infer<typeof quizSchema>;

export const defaultQuizConfig: QuizConfig = {
	hints: {
		enabled: true,
		maxHints: 100
	},
	maxErrors: 0,
	showSolution: false
};
