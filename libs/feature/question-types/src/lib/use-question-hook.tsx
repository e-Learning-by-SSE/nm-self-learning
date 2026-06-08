import { MdLookup, MdLookupArray } from "@self-learning/markdown";
import {
	createContext,
	Dispatch,
	PropsWithChildren,
	SetStateAction,
	useCallback,
	useContext,
	useRef,
	useState
} from "react";
import { InferQuestionType, QuestionType, QuestionTypeUnion } from "./question-type-registry";
import { BaseEvaluation } from "./base-question";

type PreparedAnswer = Record<string, unknown> | null;

type AnswerContextValue = {
	question: QuestionType;
	markdown: {
		questionsMd: MdLookup;
		answersMd: MdLookup;
	};
	answer: Record<string, unknown> | null;
	setAnswer: Dispatch<SetStateAction<Record<string, unknown>>>;
	evaluation: { isCorrect: boolean; isInProgress?: boolean } | null;
	setEvaluation: (ev: BaseEvaluation | null) => void;
	canSubmitAnswer: boolean;
	setCanSubmitAnswer: Dispatch<SetStateAction<boolean>>;
	prepareAnswerForEvaluation: () => PreparedAnswer;
	setPrepareAnswerForEvaluation: (prepareAnswer: (() => PreparedAnswer) | null) => void;
};

type AnswerContextProviderProps = Omit<
	AnswerContextValue,
	| "canSubmitAnswer"
	| "setCanSubmitAnswer"
	| "prepareAnswerForEvaluation"
	| "setPrepareAnswerForEvaluation"
>;

export const AnswerContext = createContext(null as unknown as AnswerContextValue);

export function AnswerContextProvider({
	children,
	question,
	answer,
	setAnswer,
	evaluation,
	setEvaluation,
	markdown
}: PropsWithChildren<AnswerContextProviderProps>) {
	// UseState to compute initial state only on first render
	const [canSubmitAnswer, setCanSubmitAnswer] = useState(() =>
		isInitialAnswerSubmittable(question, answer)
	);
	// Definition of call back signature
	const prepareAnswerForEvaluationRef = useRef<(() => PreparedAnswer) | null>(null);
	// Allows the definition of an individual setter for the prepared answer (e.g., LLM message format)
	const setPrepareAnswerForEvaluation = useCallback(
		(prepareAnswer: (() => PreparedAnswer) | null) => {
			prepareAnswerForEvaluationRef.current = prepareAnswer;
		},
		[]
	);
	// Returns either the predefined evaluation function or the individual prepared answer for evaluation (e.g., LLM message format)
	// CheckResult of question.tsx will either use the predefined answer (by the authors) or the prepared answer (if existing / LLM used) to evaluate the answer of the student.
	const prepareAnswerForEvaluation = useCallback(
		() => prepareAnswerForEvaluationRef.current?.() ?? answer,
		[answer]
	);

	const value = {
		question,
		markdown,
		answer,
		setAnswer,
		evaluation,
		setEvaluation,
		canSubmitAnswer,
		setCanSubmitAnswer,
		prepareAnswerForEvaluation,
		setPrepareAnswerForEvaluation
	};

	return <AnswerContext.Provider value={value}>{children}</AnswerContext.Provider>;
}

function isInitialAnswerSubmittable(question: QuestionType, answer: PreparedAnswer) {
	if (question.type !== "text") return true;
	if (!answer || typeof answer["value"] !== "string") return false;

	return answer["value"].trim().length > 0;
}

/**
 * Hooks that provides access to the question content and answer state.
 * Allows settings the answer state.
 *
 * @param _questionType The question type, i.e., "multiple-choice". Enables type inference of concrete question type object.
 */
export function useQuestion<
	QType extends QuestionTypeUnion["type"],
	Q = InferQuestionType<QType>["question"],
	A = InferQuestionType<QType>["answer"],
	E = InferQuestionType<QType>["evaluation"]
>(_type: QType) {
	const value = useContext(AnswerContext);

	// Attention: Might break when type is changed
	return value as unknown as {
		question: Q;
		setAnswer: Dispatch<SetStateAction<A>>;
		answer: A;
		setEvaluation: Dispatch<SetStateAction<E | null>>;
		evaluation: E | null;
		canSubmitAnswer: boolean;
		setCanSubmitAnswer: Dispatch<SetStateAction<boolean>>;
		prepareAnswerForEvaluation: () => A | null;
		setPrepareAnswerForEvaluation: (prepareAnswer: (() => A | null) | null) => void;
		markdown: {
			questionsMd: MdLookup;
			answersMd: MdLookup;
			hintsMd: MdLookupArray;
		};
	};
}
