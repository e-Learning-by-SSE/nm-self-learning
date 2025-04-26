import { z } from "zod";
import { BaseEvaluation, baseQuestionSchema } from "../../base-question";

const itemSchema = z.object({
	id: z.string(),
	content: z.string()
});

export type ArrangeItem = z.infer<typeof itemSchema>;

export const arrangeQuestionSchema = baseQuestionSchema.extend({
	type: z.literal("arrange"),
	items: z.record(z.array(itemSchema)),
	randomizeItems: z.boolean().optional().default(false)
});

export type ArrangeQuestion = z.infer<typeof arrangeQuestionSchema>;

export const arrangeAnswerSchema = z.object({
	type: z.literal("arrange"),
	value: z.record(z.array(itemSchema))
});

type ArrangeAnswer = z.infer<typeof arrangeAnswerSchema>;

export type Arrange = {
	type: "arrange";
	question: ArrangeQuestion;
	answer: ArrangeAnswer;
	evaluation: BaseEvaluation & {
		feedback: Record<
			string,
			{ isCorrect: boolean; missing: ArrangeItem[]; extra: ArrangeItem[] }
		>;
	};
};
