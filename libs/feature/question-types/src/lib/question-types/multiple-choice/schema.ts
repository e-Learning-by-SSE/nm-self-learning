import { z } from "zod";
import { baseAnswerSchema, baseQuestionSchema } from "../../base-question";

export const multipleChoiceQuestionSchema = baseQuestionSchema.extend({
	type: z.literal("multiple-choice"),
	answers: z.array(
		z.object({
			answerId: z.string(),
			content: z.string(),
			isCorrect: z.boolean()
		})
	)
});

export type MultipleChoiceQuestion = z.infer<typeof multipleChoiceQuestionSchema>;

export const multipleChoiceAnswerSchema = baseAnswerSchema.extend({
	type: z.literal("multiple-choice"),
	value: z.record(z.boolean())
});

export type MultipleChoiceAnswer = z.infer<typeof multipleChoiceAnswerSchema>;

export type MultipleChoiceEvaluation = {
	isCorrect: boolean;
	answers: { [answerId: string]: boolean };
	errorCount: number;
};

export type MultipleChoice = {
	type: "multiple-choice";
	question: MultipleChoiceQuestion;
	answer: MultipleChoiceAnswer;
	evaluation: MultipleChoiceEvaluation;
};
