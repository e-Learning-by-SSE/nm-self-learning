import { RefreshIcon } from "@heroicons/react/solid";
import type { CompiledMarkdown, MdLookup, MdLookupArray } from "@self-learning/markdown";
import {
	AnswerContextProvider,
	EVALUATION_FUNCTIONS,
	INITIAL_ANSWER_VALUE,
	MultipleChoiceAnswer,
	ProgrammingAnswer,
	QuestionType,
	ShortTextAnswer,
	TextAnswer,
	useQuestion,
	VorwissenAnswer
} from "@self-learning/question-types";
import { CenteredContainer, MarkdownContainer } from "@self-learning/ui/layouts";
import { MDXRemote } from "next-mdx-remote";
import { createContext, Dispatch, SetStateAction, useContext, useMemo, useState } from "react";
import { Certainty } from "./certainty";
import { Hints } from "./hints";

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
	evaluations: { [questionId: string]: { isCorrect: boolean } | null };
	setEvaluations: Dispatch<
		SetStateAction<{
			[questionId: string]: { isCorrect: boolean } | null;
		}>
	>;
	goToNextQuestion: () => void;
	reload: () => void;
	completionState: QuizCompletionState;
};

const QuizContext = createContext<QuizContextValue>(null as unknown as QuizContextValue);

export function useQuiz() {
	return useContext(QuizContext);
}

export function QuizProvider({
	children,
	questions,
	goToNextQuestion,
	reload
}: {
	questions: QuestionType[];
	goToNextQuestion: () => void;
	reload: () => void;
	children: React.ReactNode;
}) {
	const [answers, setAnswers] = useState(() => {
		const ans: QuizContextValue["answers"] = {};

		for (const q of questions) {
			ans[q.questionId] = {
				type: q.type,
				value: INITIAL_ANSWER_VALUE[q.type]
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

		if (allEvaluations.every(e => e && e.isCorrect === true)) {
			return "completed";
		}

		return "failed";
	}, [evaluations]);

	return (
		<QuizContext.Provider
			value={{
				answers,
				setAnswers,
				evaluations,
				setEvaluations,
				goToNextQuestion,
				completionState,
				reload
			}}
		>
			{children}
		</QuizContext.Provider>
	);
}

export function Question({
	question,
	markdown
}: {
	question: QuestionType;
	markdown: {
		questionsMd: MdLookup;
		answersMd: MdLookup;
		hintsMd: MdLookupArray;
	};
}) {
	const { answers, setAnswers, evaluations, setEvaluations } = useContext(QuizContext);

	const [usedHints, setUsedHints] = useState<CompiledMarkdown[]>([]);
	const hintsAvailable = question.hints && question.hints.length > 0;
	const allHints = markdown.hintsMd[question.questionId] ?? [];

	const answer = answers[question.questionId];
	const evaluation = evaluations[question.questionId];

	function setAnswer(v: any) {
		const value = typeof v === "function" ? v(answer) : v;

		setAnswers(prev => ({
			...prev,
			[question.questionId]: value
		}));
	}

	function setEvaluation(e: any) {
		setEvaluations(prev => ({
			...prev,
			[question.questionId]: e
		}));
	}

	function useHint() {
		const nextHintIndex = usedHints.length;

		if (nextHintIndex < allHints.length) {
			const nextHint = markdown.hintsMd[question.questionId][nextHintIndex];
			setUsedHints(prev => [...prev, nextHint]);
		}
	}

	return (
		<AnswerContextProvider
			question={question}
			answer={answer}
			setAnswer={setAnswer}
			markdown={markdown}
			evaluation={evaluation}
			setEvaluation={setEvaluation}
		>
			<article className="flex flex-col gap-8">
				<div>
					<div className="flex items-center justify-between">
						<span className="font-semibold text-secondary" data-testid="questionType">
							{question.type}
						</span>
						<div className="flex gap-4">
							<button
								className="btn-stroked h-fit"
								onClick={() => setEvaluation(null)}
							>
								Reset
							</button>
							<CheckResult setEvaluation={setEvaluation} />
						</div>
					</div>
					{markdown.questionsMd[question.questionId] ? (
						<MarkdownContainer>
							<MDXRemote {...markdown.questionsMd[question.questionId]} />
						</MarkdownContainer>
					) : (
						<span className="text-red-500">Error: No markdown content found.</span>
					)}
				</div>

				<div className="flex max-w-full flex-col gap-8">
					<Answer question={question} />
				</div>

				{question.withCertainty && <Certainty />}

				{hintsAvailable && (
					<Hints
						totalHintsCount={allHints.length}
						usedHints={usedHints}
						useHint={useHint}
					/>
				)}
			</article>
		</AnswerContextProvider>
	);
}

function CheckResult({
	setEvaluation
}: {
	setEvaluation: (ev: { isCorrect: boolean } | null) => void;
}) {
	// We only use "multiple-choice" to get better types ... works for all question types
	const { question, answer, evaluation: currentEvaluation } = useQuestion("multiple-choice");
	const { goToNextQuestion, completionState, reload } = useQuiz();

	function checkResult() {
		console.log("checking...");
		const evaluation = EVALUATION_FUNCTIONS[question.type](question, answer);
		console.log("question", question);
		console.log("answer", answer);
		console.log("evaluation", evaluation);
		setEvaluation(evaluation);
	}

	if (!currentEvaluation) {
		<span className="text-red-500">No question state found for this question.</span>;
	}

	return (
		<>
			{completionState === "in-progress" ? (
				<button
					className="btn-primary"
					onClick={currentEvaluation ? goToNextQuestion : checkResult}
				>
					{currentEvaluation ? "Nächste Frage" : "Überprüfen"}
				</button>
			) : completionState === "failed" ? (
				<button className="btn bg-red-500" onClick={reload}>
					<span>Erneut probieren</span>
					<RefreshIcon className="h-5" />
				</button>
			) : (
				// eslint-disable-next-line react/jsx-no-useless-fragment
				<></>
			)}
			{/* {eslint-disable-next-line react/jsx-no-useless-fragment} */}
		</>
	);
}

function Answer({ question }: { question: QuestionType }) {
	// Works, but prevents HMR :(
	// const component = QUESTION_ANSWER_COMPONENTS[question.type];

	// if (component) {
	// 	return component();
	// }

	if (question.type === "programming") {
		return <ProgrammingAnswer />;
	}

	if (question.type === "multiple-choice") {
		return <MultipleChoiceAnswer />;
	}

	if (question.type === "short-text") {
		return <ShortTextAnswer />;
	}

	if (question.type === "text") {
		return <TextAnswer />;
	}

	if (question.type === "vorwissen") {
		return <VorwissenAnswer />;
	}

	return (
		<CenteredContainer className="text-red-500">
			Error: No implementation found for "{(question as { type: string }).type}".
		</CenteredContainer>
	);
}
