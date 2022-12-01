import { z } from "zod";
import { BaseEvaluation, baseQuestionSchema } from "../../base-question";

export const textQuestionSchema = baseQuestionSchema.extend({
	type: z.literal("text")
});

export type TextQuestion = z.infer<typeof textQuestionSchema>;

export type Text = {
	type: "text";
	question: TextQuestion;
	answer: {
		type: "text";
		value: string;
	};
	evaluation: BaseEvaluation;
};
