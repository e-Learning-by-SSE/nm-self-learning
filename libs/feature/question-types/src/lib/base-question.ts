import { getRandomId } from "@self-learning/util/common";
import { z } from "zod";

export const baseQuestionSchema = z.object({
	questionId: z.string(),
	// Optional cognitive level as specified by Bloom, must be between 1-6 if specified
	cognitiveLevel: z.number().int().min(1).max(6).optional(),
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

/**
 * Returns an empty {@link BaseQuestion} object.
 *
 * @example
 * const multipleChoiceQuestion: MultipleChoiceQuestion = {
 * 	...createBaseQuestion(),
 * 	type: "multiple-choice", // Important: Set the concrete question type
 * 	answers: [],
 * };
 */
export function createBaseQuestion(): BaseQuestion {
	return {
		type: "",
		questionId: getRandomId(),
		statement: "",
		withCertainty: false,
		hints: []
	};
}

export type QuestionTypeForm<T> = { quiz: { questions: T[] } };
