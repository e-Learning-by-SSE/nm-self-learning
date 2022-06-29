import { MdLookup } from "@self-learning/markdown";
import {
	createContext,
	Dispatch,
	PropsWithChildren,
	SetStateAction,
	useContext,
	useState
} from "react";
import { QuestionType } from "./quiz-schema";

export const AnswerContext = createContext(
	null as unknown as {
		question: QuestionType;
		markdown: {
			questionsMd: MdLookup;
			answersMd: MdLookup;
		};
		answer: Record<string, unknown>;
		setAnswer: Dispatch<SetStateAction<Record<string, unknown>>>;
		showResult: boolean;
	}
);

export function AnswerContextProvider({
	children,
	question,
	markdown,
	showResult
}: PropsWithChildren<{
	question: QuestionType;
	showResult: boolean;
	markdown: {
		questionsMd: MdLookup;
		answersMd: MdLookup;
	};
}>) {
	const [answer, setAnswer] = useState<Record<string, unknown>>({});
	const [evaluation, setEvaluation] = useState<unknown | null>(null);

	const value = {
		question,
		markdown,
		answer,
		setAnswer,
		setEvaluation,
		showResult,
		evaluation
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
export function useQuestion<Q = any, A = any, E = any>() {
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
		showResult: boolean;
	};
}
