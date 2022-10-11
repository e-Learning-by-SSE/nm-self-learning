import { MdLookup } from "@self-learning/markdown";
import {
	createContext,
	Dispatch,
	PropsWithChildren,
	SetStateAction,
	useContext,
	useState
} from "react";
import { InferQuestionType, QuestionType, QuestionTypeUnion } from "./quiz-schema";

export const AnswerContext = createContext(
	null as unknown as {
		question: QuestionType;
		markdown: {
			questionsMd: MdLookup;
			answersMd: MdLookup;
		};
		answer: Record<string, unknown>;
		setAnswer: Dispatch<SetStateAction<Record<string, unknown>>>;
		evaluation: unknown | null;
		setEvaluation: Dispatch<SetStateAction<unknown | null>>;
	}
);

export function AnswerContextProvider({
	children,
	question,
	markdown,
	evaluation,
	setEvaluation
}: PropsWithChildren<{
	question: QuestionType;
	evaluation: unknown | null;
	setEvaluation: Dispatch<SetStateAction<unknown | null>>;
	markdown: {
		questionsMd: MdLookup;
		answersMd: MdLookup;
	};
}>) {
	const [answer, setAnswer] = useState<Record<string, unknown>>({
		type: question.type,
		questionId: question.questionId,
		value: null
	});

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
