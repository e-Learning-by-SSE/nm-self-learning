import { z } from "zod";
import { BaseEvaluation, baseQuestionSchema } from "../../base-question";

export const textVerdictSchema = z.enum([
	"correct",
	"partially-correct",
	"partially-wrong",
	"wrong"
]);

export type TextVerdict = z.infer<typeof textVerdictSchema>;

export const aiEvaluationConfigSchema = z.object({
	solutionOrConcepts: z.string(),
	passingThreshold: z.number().int().min(0).max(100)
});

export type AiEvaluationConfig = z.infer<typeof aiEvaluationConfigSchema>;

export const textQuestionSchema = baseQuestionSchema.extend({
	type: z.literal("text"),
	aiEvaluation: aiEvaluationConfigSchema.optional()
});

export type TextQuestion = z.infer<typeof textQuestionSchema>;

export type TextEvaluation = BaseEvaluation & {
	verdict: TextVerdict;
	feedback?: string;
	evaluationError?: boolean;
};

export type Text = {
	type: "text";
	question: TextQuestion;
	answer: {
		type: "text";
		value: string;
	};
	evaluation: TextEvaluation;
};

export interface TextEvaluateRouterInput {
	questionStatement: string;
	solutionOrConcepts: string;
	passingThreshold: number;
	studentAnswer: string;
}
export interface TextEvaluateRouterOutput {
	verdict: TextVerdict;
	feedback: string;
}
