import { z } from "zod";
import { BaseEvaluation } from "./base-question";
import { ClozeAnswer } from "./question-types/cloze/component";
import { Cloze, clozeQuestionSchema } from "./question-types/cloze/schema";
import { MultipleChoiceAnswer } from "./question-types/multiple-choice/component";
import { evaluateMultipleChoice } from "./question-types/multiple-choice/evaluate";
import {
	MultipleChoice,
	multipleChoiceAnswerSchema,
	multipleChoiceQuestionSchema
} from "./question-types/multiple-choice/schema";
import { ProgrammingAnswer } from "./question-types/programming/component";
import { evaluateProgramming } from "./question-types/programming/evaluate";
import { Programming, programmingQuestionSchema } from "./question-types/programming/schema";
import { ShortTextAnswer } from "./question-types/short-text/component";
import { evaluateShortText } from "./question-types/short-text/evaluate";
import {
	ShortText,
	shortTextAnswerSchema,
	shortTextQuestionSchema
} from "./question-types/short-text/schema";
import { TextAnswer } from "./question-types/text/component";
import { Text, textQuestionSchema } from "./question-types/text/schema";
import { VorwissenAnswer } from "./question-types/vorwissen/component";
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

export type EvaluationFn<QType extends QuestionType["type"]> = (
	question: InferQuestionType<QType>["question"],
	answer: InferQuestionType<QType>["answer"]
) => InferQuestionType<QType>["evaluation"];

export type InitialAnswerFn<QType extends QuestionType["type"]> = (
	question: InferQuestionType<QType>["question"]
) => InferQuestionType<QType>["answer"]["value"];

export const EVALUATION_FUNCTIONS: { [QType in QuestionType["type"]]: EvaluationFn<QType> } = {
	"multiple-choice": evaluateMultipleChoice,
	cloze: (q, a) => {
		console.error(`Evaluation function for ${q.type} is not implemented.}`);
		return { isCorrect: true };
	},
	text: (q, a) => {
		console.error(`Evaluation function for ${q.type} is not implemented.}`);
		return { isCorrect: true };
	},
	"short-text": evaluateShortText,
	vorwissen: (q, a) => {
		console.error(`Evaluation function for ${q.type} is not implemented.}`);
		return { isCorrect: true };
	},
	programming: evaluateProgramming
};

// export const QUESTION_ANSWER_COMPONENTS: { [QType in QuestionType["type"]]: () => JSX.Element } = {
// 	"multiple-choice": MultipleChoiceAnswer,
// 	"short-text": ShortTextAnswer,
// 	programming: ProgrammingAnswer,
// 	text: TextAnswer,
// 	vorwissen: VorwissenAnswer,
// 	cloze: ClozeAnswer as any
// };

export const INITIAL_ANSWER_VALUE_FUNCTIONS: {
	[QType in QuestionType["type"]]: InitialAnswerFn<QType>;
} = {
	"multiple-choice": () => ({}),
	"short-text": () => "",
	programming: question => ({
		solution: question.custom.solutionTemplate,
		stdout: "",
		signal: null,
		code: null
	}),
	text: () => "",
	vorwissen: () => ({} as any),
	cloze: () => ({} as any)
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
	QType extends QuestionTypeUnion["type"],
	Union = QuestionTypeUnion
> = Union extends {
	type: QType;
}
	? Union
	: never;
