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
	}
);

export function AnswerContextProvider({
	children,
	question,
	markdown
}: PropsWithChildren<{
	question: QuestionType;
	markdown: {
		questionsMd: MdLookup;
		answersMd: MdLookup;
	};
}>) {
	const [answer, setAnswer] = useState<Record<string, unknown>>({});

	const value = {
		question,
		markdown,
		answer,
		setAnswer
	};

	return <AnswerContext.Provider value={value}>{children}</AnswerContext.Provider>;
}

export function useQuestion<QType extends QuestionType, AnswerType = Record<string, unknown>>() {
	const value = useContext(AnswerContext);

	// Attention: Might break when type is changed
	return value as unknown as {
		question: QType; // Use exact type
		setAnswer: Dispatch<SetStateAction<AnswerType>>;
		answer: AnswerType;
		markdown: {
			questionsMd: MdLookup;
			answersMd: MdLookup;
		};
	};
}
