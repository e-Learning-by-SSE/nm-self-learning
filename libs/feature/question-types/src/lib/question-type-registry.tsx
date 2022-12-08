/*
	ALL QUESTION TYPES MUST BE REGISTERED IN THIS FILE!
	
	1. Add the question's type to the `QuestionTypeUnion` type
	   - This will enable type inference for the question type and the compiler will complain, if 
		 some of the following steps are missing
	   - Type must have the following structure:
		 {
		 	type: "my-question-type"; // String Literal, must be unique across all question types 
		 	question: BaseQuestion & { myCustomProperty: string }; // contains question statement and config
		 	answer: MyAnswerType; // defines the intended shape of the student's answer
		 	evaluation: BaseEvaluation & MyEvaluationType; // Defines shape of evaluation result, i.e., whether the answer is correct and feedback
		 }

	2. Add the question's zod validation schema to the `quizContentSchema`
	   - Schema is used to validate a question's content, i.e., before it is stored in the database
	   - If it is not added here, validation will fail and the quiz will not be stored

	3. Add a `dynamic` import to load the question's answer and form component (see below) and add it
	   to the `QuestionAnswerRenderer` and `QuestionFormRenderer` component
		- Advice: Use a `default export` to export these components to reduce boilerplate

	4. Add the new question type to the `EVALUATION_FUNCTIONS`, `INITIAL_ANSWER_VALUE_FUNCTIONS` and 
	   `INITIAL_QUESTION_CONFIGURATION_FUNCTIONS` objects and implement the required functions.
*/

import dynamic from "next/dynamic";
import { z } from "zod";
import { createBaseQuestion } from "./base-question";
import { evaluateExactAnswer } from "./question-types/exact/evaluate";
import { Exact, exactAnswerSchema, exactQuestionSchema } from "./question-types/exact/schema";
import { evaluateMultipleChoice } from "./question-types/multiple-choice/evaluate";
import {
	MultipleChoice,
	multipleChoiceAnswerSchema,
	multipleChoiceQuestionSchema
} from "./question-types/multiple-choice/schema";
import { evaluateProgramming } from "./question-types/programming/evaluate";
import { Programming, programmingQuestionSchema } from "./question-types/programming/schema";
import { Text, textQuestionSchema } from "./question-types/text/schema";

const ProgrammingAnswer = dynamic(() => import("./question-types/programming/component"), {
	ssr: false
});
const ProgrammingForm = dynamic(() => import("./question-types/programming/form"), {
	ssr: false
});
const MultipleChoiceAnswer = dynamic(() => import("./question-types/multiple-choice/component"), {
	ssr: false
});
const MultipleChoiceForm = dynamic(() => import("./question-types/multiple-choice/form"), {
	ssr: false
});
const ExactAnswer = dynamic(() => import("./question-types/exact/component"), {
	ssr: false
});
const ExactForm = dynamic(() => import("./question-types/exact/form"), {
	ssr: false
});
const TextAnswer = dynamic(() => import("./question-types/text/component"), { ssr: false });
const TextForm = dynamic(() => import("./question-types/text/form"), { ssr: false });

export type QuestionTypeUnion = MultipleChoice | Exact | Text | Programming;

export const quizContentSchema = z.discriminatedUnion("type", [
	multipleChoiceQuestionSchema,
	exactQuestionSchema,
	textQuestionSchema,
	programmingQuestionSchema
]);

export const quizAnswerSchema = z.discriminatedUnion("type", [
	multipleChoiceAnswerSchema,
	exactAnswerSchema
]);

/**
 * Object that contains the evaluation function of each question type.
 */
export const EVALUATION_FUNCTIONS: { [QType in QuestionType["type"]]: EvaluationFn<QType> } = {
	"multiple-choice": evaluateMultipleChoice,
	text: (q, _a) => {
		console.error(`Evaluation function for ${q.type} is not implemented.}`);
		return { isCorrect: true };
	},
	exact: evaluateExactAnswer,
	programming: evaluateProgramming
};

/**
 * Object containing a function returning the initial (empty) answer value of each question type.
 */
export const INITIAL_ANSWER_VALUE_FUNCTIONS: {
	[QType in QuestionType["type"]]: InitialAnswerFn<QType>;
} = {
	"multiple-choice": () => ({}),
	exact: () => "",
	programming: question => ({
		solution: question.custom.solutionTemplate,
		stdout: "",
		signal: null,
		code: null
	}),
	text: () => ""
};

/**
 * Object containing a function returning the initial question configuration of each question type.
 */
export const INITIAL_QUESTION_CONFIGURATION_FUNCTIONS: {
	[QType in QuestionType["type"]]: () => InferQuestionType<QType>["question"];
} = {
	"multiple-choice": () => ({
		...createBaseQuestion(),
		type: "multiple-choice",
		answers: []
	}),
	exact: () => ({
		...createBaseQuestion(),
		type: "exact",
		acceptedAnswers: []
	}),
	text: () => ({
		...createBaseQuestion(),
		type: "text"
	}),
	programming: () => ({
		...createBaseQuestion(),
		type: "programming",
		language: "java",
		custom: {
			mode: "standalone",
			expectedOutput: "",
			solutionTemplate: ""
		}
	})
};

/**
 * Object containing the display name of each question type.
 * This name is shown to users to indicate the question type.
 */
export const QUESTION_TYPE_DISPLAY_NAMES: {
	[QType in QuestionType["type"]]: string;
} = {
	"multiple-choice": "Multiple-Choice",
	exact: "Exakte Antwort",
	text: "Freitext",
	programming: "Programmierung"
};

/**
 * Component that renders the appropriate answer component for a given question type.
 */
export function QuestionAnswerRenderer({ question }: { question: QuestionType }) {
	if (question.type === "programming") {
		return <ProgrammingAnswer />;
	}

	if (question.type === "multiple-choice") {
		return <MultipleChoiceAnswer />;
	}

	if (question.type === "exact") {
		return <ExactAnswer />;
	}

	if (question.type === "text") {
		return <TextAnswer />;
	}

	return (
		<span className="text-red-500">
			Error: No implementation found for "{(question as { type: string }).type}".
		</span>
	);
}

/**
 * Component that renders the appropriate form component for a given question type.
 */
export function QuestionFormRenderer({
	question,
	index
}: {
	question: QuestionType;
	index: number;
}) {
	if (question.type === "multiple-choice") {
		return <MultipleChoiceForm question={question} index={index} />;
	}

	if (question.type === "exact") {
		return <ExactForm question={question} index={index} />;
	}

	if (question.type === "programming") {
		return <ProgrammingForm question={question} index={index} />;
	}

	if (question.type === "text") {
		return <TextForm question={question} index={index} />;
	}

	return (
		<span className="text-red-500">
			Error: No implementation found for "{(question as { type: string }).type}".
		</span>
	);
}

export type QuestionType = z.infer<typeof quizContentSchema>;
export type QuizAnswers = z.infer<typeof quizAnswerSchema>;
export type QuizContent = QuestionType[];

export type EvaluationFn<QType extends QuestionType["type"]> = (
	question: InferQuestionType<QType>["question"],
	answer: InferQuestionType<QType>["answer"]
) => InferQuestionType<QType>["evaluation"];

export type InitialAnswerFn<QType extends QuestionType["type"]> = (
	question: InferQuestionType<QType>["question"]
) => InferQuestionType<QType>["answer"]["value"];

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
