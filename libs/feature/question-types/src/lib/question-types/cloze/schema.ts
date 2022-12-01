import { z } from "zod";
import { BaseEvaluation, baseQuestionSchema } from "../../base-question";

export const clozeQuestionSchema = baseQuestionSchema.extend({
	type: z.literal("cloze"),
	textArray: z.array(z.string())
});

export type ClozeQuestion = z.infer<typeof clozeQuestionSchema>;

export type Cloze = {
	type: "cloze";
	question: ClozeQuestion;
	answer: {
		type: "cloze";
		value: unknown;
	};
	evaluation: BaseEvaluation;
};
