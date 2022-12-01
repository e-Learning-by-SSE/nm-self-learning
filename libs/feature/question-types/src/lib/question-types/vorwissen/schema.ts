import { z } from "zod";
import { BaseEvaluation, baseQuestionSchema } from "../../base-question";

export const vorwissenQuestionSchema = baseQuestionSchema.extend({
	type: z.literal("vorwissen"),
	answers: z.array(
		z.object({
			answerId: z.string(),
			content: z.string(),
			isCorrect: z.boolean()
		})
	),
	requireExplanationForAnswerIds: z.string()
});

export type VorwissenQuestion = z.infer<typeof vorwissenQuestionSchema>;

export type Vorwissen = {
	type: "vorwissen";
	question: VorwissenQuestion;
	answer: {
		type: "vorwissen";
		value: {
			vorwissen: string;
			explanation: {
				content: string;
				doesNotKnow: boolean;
			};
			selectedAnswers: { [answerId: string]: boolean };
		};
	};
	evaluation: BaseEvaluation;
};
