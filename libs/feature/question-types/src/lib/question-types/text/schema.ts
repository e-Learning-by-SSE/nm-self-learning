import { z } from "zod";
import { BaseEvaluation, baseQuestionSchema } from "../../base-question";

// FR-02: The four verdict levels the AI can return
export const textVerdictSchema = z.enum([
	"correct",
	"partially-correct",
	"partially-wrong",
	"wrong"
]);

export type TextVerdict = z.infer<typeof textVerdictSchema>;

// FR-01: Optional AI evaluation config the teacher sets up
// Making it optional with .optional() means old questions without this field
export const aiEvaluationConfigSchema = z.object({
	// A single free-text field — either a sample solution or a concept list.
	// The AI interprets which kind it is automatically (no need for teacher to specify).
	solutionOrConcepts: z.string().min(1),
	// 0–100: how much of the solution is needed to pass
	passingThreshold: z.number().int().min(0).max(100)
});

export type AiEvaluationConfig = z.infer<typeof aiEvaluationConfigSchema>;

// FR-01: Extend the base question schema with the optional aiEvaluation field
export const textQuestionSchema = baseQuestionSchema.extend({
	type: z.literal("text"),
	// optional() means: field may be absent entirely (old questions) → still valid
	aiEvaluation: aiEvaluationConfigSchema.optional()
});

export type TextQuestion = z.infer<typeof textQuestionSchema>;

// FR-02: Richer evaluation result compared to the old BaseEvaluation
// isCorrect is still present (inherited via BaseEvaluation) for the quiz engine
export type TextEvaluation = BaseEvaluation & {
	// FR-02: The detailed four-level verdict label to show the student
	verdict: TextVerdict;
	// FR-02: The AI's explanation text. Optional because legacy/error cases may not have it.
	feedback?: string;
	// true when evaluation failed for any reason (no LLM config, API error, etc.)
	// FR-16: used by component to show the unified fallback message
	evaluationError?: boolean;
};

// The full "Text" type that the registry uses for type inference
export type Text = {
	type: "text";
	question: TextQuestion;
	answer: {
		type: "text";
		value: string;
	};
	evaluation: TextEvaluation;
};
