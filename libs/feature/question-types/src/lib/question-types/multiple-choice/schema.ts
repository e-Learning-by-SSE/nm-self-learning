import { z } from "zod";
import { baseQuestionSchema } from "../../base-question";

export const multipleChoiceAnswerSchema = z.object({
	answerId: z.string(),
	content: z.string(),
	isCorrect: z.boolean()
});

export type MultipleChoiceAnswerType = z.infer<typeof multipleChoiceAnswerSchema>;

export const multipleChoiceQuestionSchema = baseQuestionSchema.extend({
	type: z.literal("multiple-choice"),
	answers: z.array(multipleChoiceAnswerSchema)
});

export type MultipleChoiceQuestion = z.infer<typeof multipleChoiceQuestionSchema>;
