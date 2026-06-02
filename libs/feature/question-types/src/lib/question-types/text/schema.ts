import { z } from "zod";
import { BaseEvaluation, baseQuestionSchema } from "../../base-question";

export const textVerdictSchema = z.enum([
	"correct",
	"partially-correct",
	"partially-wrong",
	"wrong"
]);

export const TEXT_AI_EVALUATION_PASSING_THRESHOLD_MIN = 0;
export const TEXT_AI_EVALUATION_PASSING_THRESHOLD_MAX = 100;

export type TextVerdict = z.infer<typeof textVerdictSchema>;

export const aiEvaluationConfigSchema = z.object({
	solutionOrConcepts: z.string(),
	passingThreshold: z
		.number()
		.int()
		.min(TEXT_AI_EVALUATION_PASSING_THRESHOLD_MIN)
		.max(TEXT_AI_EVALUATION_PASSING_THRESHOLD_MAX)
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
	pending?: boolean;
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

// Discriminated union — the router always resolves, never rejects.
// ok: false means any failure (no config, LLM error, parse error).
export type TextEvaluateRouterOutput =
	| { ok: true; verdict: TextVerdict; feedback: string }
	| { ok: false };
