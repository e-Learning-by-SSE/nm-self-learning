import { z } from "zod";
import { baseAnswerSchema, BaseEvaluation, baseQuestionSchema } from "../../base-question";

export const exactQuestionSchema = baseQuestionSchema.extend({
	type: z.literal("exact"),
	isNumber: z.boolean().optional(),
	acceptedAnswers: z.array(
		z.object({
			acceptedAnswerId: z.string(),
			value: z.string()
		})
	)
});

export type ExactQuestion = z.infer<typeof exactQuestionSchema>;

export const exactAnswerSchema = baseAnswerSchema.extend({
	type: z.literal("exact"),
	value: z.union([z.string(), z.number()])
});

export type ExactAnswer = z.infer<typeof exactAnswerSchema>;

export type Exact = {
	type: "exact";
	question: ExactQuestion;
	answer: ExactAnswer;
	evaluation: BaseEvaluation & {
		acceptedAnswerId: string | null;
	};
};
