import { MdLookup } from "@self-learning/markdown";
import { createContext, Dispatch, PropsWithChildren, SetStateAction, useContext } from "react";
import { InferQuestionType, QuestionType, QuestionTypeUnion } from "./quiz-schema";

type AnswerContextValue = {
	question: QuestionType;
	markdown: {
		questionsMd: MdLookup;
		answersMd: MdLookup;
	};
	answer: Record<string, unknown> | null;
	setAnswer: Dispatch<SetStateAction<Record<string, unknown>>>;
	evaluation: { isCorrect: boolean } | null;
	setEvaluation: (ev: { isCorrect: boolean } | null) => void;
};

export const AnswerContext = createContext(null as unknown as AnswerContextValue);

export function AnswerContextProvider({
	children,
	question,
	answer,
	setAnswer,
	evaluation,
	setEvaluation,
	markdown
}: PropsWithChildren<AnswerContextValue>) {
	const value = {
		question,
		markdown,
		answer,
		setAnswer,
		evaluation,
		setEvaluation
	};

	return <AnswerContext.Provider value={value}>{children}</AnswerContext.Provider>;
}

/**
 * Hooks that provides access to the question content and answer state.
 * Allows settings the answer state.
 *
 * @param _questionType The question type, i.e., "multiple-choice". Enables type inference of concrete question type object.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useQuestion<
	QType extends QuestionTypeUnion["type"],
	Q = InferQuestionType<QType>["question"],
	A = InferQuestionType<QType>["answer"],
	E = InferQuestionType<QType>["evaluation"]
>(qtype: QType) {
	const value = useContext(AnswerContext);

	// Attention: Might break when type is changed
	return value as unknown as {
		question: Q;
		setAnswer: Dispatch<SetStateAction<A>>;
		answer: A;
		setEvaluation: Dispatch<SetStateAction<E | null>>;
		evaluation: E | null;
		markdown: {
			questionsMd: MdLookup;
			answersMd: MdLookup;
		};
	};
}
