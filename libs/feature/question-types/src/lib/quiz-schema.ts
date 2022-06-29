import { z } from "zod";
import { Cloze, clozeQuestionSchema } from "./question-types/cloze/schema";
import { evaluateMultipleChoice } from "./question-types/multiple-choice/evaluate";
import {
	MultipleChoice,
	multipleChoiceAnswerSchema,
	multipleChoiceQuestionSchema
} from "./question-types/multiple-choice/schema";
import { Programming, programmingQuestionSchema } from "./question-types/programming/schema";
import {
	ShortText,
	shortTextAnswerSchema,
	shortTextQuestionSchema
} from "./question-types/short-text/schema";
import { Text, textQuestionSchema } from "./question-types/text/schema";
import { Vorwissen, vorwissenQuestionSchema } from "./question-types/vorwissen/schema";

export const quizContentSchema = z.discriminatedUnion("type", [
	multipleChoiceQuestionSchema,
	shortTextQuestionSchema,
	textQuestionSchema,
	vorwissenQuestionSchema,
	programmingQuestionSchema,
	clozeQuestionSchema
]);

export const quizAnswerSchema = z.discriminatedUnion("type", [
	multipleChoiceAnswerSchema,
	shortTextAnswerSchema
]);

export type QuestionTypeUnion = MultipleChoice | ShortText | Text | Vorwissen | Programming | Cloze;

type EvaluationFn<QType extends QuestionType["type"]> = (
	question: InferQuestionType<QType>["question"],
	answer: InferQuestionType<QType>["answer"]
) => InferQuestionType<QType>["evaluation"];

export const EVALUATION_FUNCTIONS: { [QType in QuestionType["type"]]: EvaluationFn<QType> } = {
	"multiple-choice": evaluateMultipleChoice,
	cloze: (q, a) => {
		return "Not implemented.";
	},
	text: (q, a) => {
		return "Not implemented.";
	},
	"short-text": (q, a) => {
		return "Not implemented.";
	},
	vorwissen: (q, a) => {
		return "Not implemented.";
	},
	programming: (q, a) => {
		return "Not implemented.";
	}
};

export type QuestionType = z.infer<typeof quizContentSchema>;
export type QuizAnswers = z.infer<typeof quizAnswerSchema>;
export type QuizContent = QuestionType[];

/**
 * Given the `type` of a question (i.e. `multiple-choice`), returns the type for the `question`,
 * `answer` and `evaluation` of this question type.
 *
 * @example
 * type Q = InferQuestionType<"multiple-choice">
 * // {
 * //	type: "multiple-choice";
 * // 	question: MultipleChoiceQuestion;
 * // 	answer: MultipleChoiceAnswer;
 * // 	evaluation: MultipleChoiceEvaluation;
 * // }
 */
export type InferQuestionType<
	CType extends QuestionTypeUnion["type"],
	Union = QuestionTypeUnion
> = Union extends {
	type: CType;
}
	? Union
	: never;
