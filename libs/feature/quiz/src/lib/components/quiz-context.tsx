import type { MdLookupArray } from "@self-learning/markdown";
import {
	BaseEvaluation,
	INITIAL_ANSWER_VALUE_FUNCTIONS,
	QuestionType
} from "@self-learning/question-types";
import { createContext, Dispatch, SetStateAction, useContext, useMemo, useState } from "react";
import { QuizConfig } from "../quiz";
import { useRouter } from "next/router";
import { useCookies } from "react-cookie";
import { QuizSavedAnswers } from "./question";

type QuizCompletionState = "in-progress" | "completed" | "failed";

export type QuizContextValue = {
	answers: {
		[questionId: string]: {
			type: QuestionType["type"];
			value: unknown;
		} | null;
	};
	setAnswers: Dispatch<
		SetStateAction<{
			[questionId: string]: {
				type: QuestionType["type"];
				value: unknown;
			} | null;
		}>
	>;
	evaluations: { [questionId: string]: BaseEvaluation | null };
	setEvaluations: Dispatch<
		SetStateAction<{
			[questionId: string]: BaseEvaluation | null;
		}>
	>;
	config: QuizConfig;
	completionState: QuizCompletionState;
	usedHints: MdLookupArray;
	setUsedHints: Dispatch<SetStateAction<MdLookupArray>>;
	goToNextQuestion: () => void;
	reload: () => void;
};

const QuizContext = createContext<QuizContextValue>(null as unknown as QuizContextValue);

export function useQuiz() {
	return useContext(QuizContext);
}

export function QuizProvider({
	children,
	questions,
	config,
	goToNextQuestion,
	reload
}: {
	questions: QuestionType[];
	config: QuizConfig;
	goToNextQuestion: () => void;
	reload: () => void;
	children: React.ReactNode;
}) {
	const [cookies] = useCookies(["quiz_answers_save"]);

	const { answers: quizAnswers, lessonSlug: quizLessonSlug }: QuizSavedAnswers = cookies[
		"quiz_answers_save"
	] || { answers: null, lessonSlug: null };

	const router = useRouter();
	const [answers, setAnswers] = useState(() => {
		const ans: QuizContextValue["answers"] = {};

		if (quizAnswers && quizAnswers && router.asPath.endsWith(quizLessonSlug + "/quiz")) {
			return quizAnswers as typeof ans;
		}

		for (const q of questions) {
			ans[q.questionId] = {
				type: q.type,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				value: INITIAL_ANSWER_VALUE_FUNCTIONS[q.type](q as any)
			};
		}
		return ans;
	});

	const [evaluations, setEvaluations] = useState(() => {
		const evals: QuizContextValue["evaluations"] = {};

		for (const q of questions) {
			evals[q.questionId] = null;
		}
		return evals;
	});

	const completionState: QuizCompletionState = useMemo(() => {
		const allEvaluations = Object.values(evaluations);

		if (allEvaluations.some(e => !e)) {
			return "in-progress";
		}

		if (allEvaluations.every(e => e && e.isCorrect)) {
			return "completed";
		}

		return "failed";
	}, [evaluations]);

	const [usedHints, setUsedHints] = useState<MdLookupArray>({});

	return (
		<QuizContext.Provider
			value={{
				config,
				answers,
				setAnswers,
				evaluations,
				setEvaluations,
				usedHints,
				setUsedHints,
				goToNextQuestion,
				completionState,
				reload
			}}
		>
			{children}
		</QuizContext.Provider>
	);
}
