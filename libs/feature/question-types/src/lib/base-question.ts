import { z } from "zod";

export const baseQuestionSchema = z.object({
	questionId: z.string(),
	type: z.string(),
	statement: z.string(),
	withCertainty: z.boolean(),
	hints: z.array(
		z.object({
			hintId: z.string(),
			content: z.string()
		})
	)
});

export type BaseQuestion = z.infer<typeof baseQuestionSchema>;

export const baseAnswerSchema = z.object({
	questionId: z.string(),
	type: z.string(),
	value: z.any()
});

/** Every evaluation function should return an object that satisfies this type. */
export type BaseEvaluation = {
	isCorrect: boolean;
};
