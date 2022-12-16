import { z } from "zod";
import { BaseEvaluation, baseQuestionSchema } from "../../base-question";

export const clozeQuestionSchema = baseQuestionSchema.extend({
	type: z.literal("cloze"),
	clozeText: z.string()
});

export type ClozeQuestion = z.infer<typeof clozeQuestionSchema>;

export type Cloze = {
	type: "cloze";
	question: ClozeQuestion;
	answer: {
		type: "cloze";
		value: string[];
	};
	evaluation: BaseEvaluation & {
		incorrectAnswers: { index: number; studentAnswer: string; intendedAnswers: string[] }[];
	};
};
