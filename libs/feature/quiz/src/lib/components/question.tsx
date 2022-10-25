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
import { createContext, Dispatch, SetStateAction, useContext, useState } from "react";
import { Certainty } from "./certainty";
import { Hints } from "./hints";

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
	evaluations: { [questionId: string]: unknown | null };
	setEvaluations: Dispatch<
		SetStateAction<{
			[questionId: string]: unknown;
		}>
	>;
};

const QuizContext = createContext<QuizContextValue>(null as unknown as QuizContextValue);

export function QuizProvider({
	children,
	questions
}: {
	questions: QuestionType[];
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

	return (
		<QuizContext.Provider value={{ answers, setAnswers, evaluations, setEvaluations }}>
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

	console.log("answers", answers);
	console.log("evaluations", evaluations);
	console.log("answer", answer);
	console.log("evaluation", evaluation);

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
						<span className="font-semibold text-secondary">{question.type}</span>
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
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const { question, answer, evaluation: currentEvaluation } = useQuestion(null as any);

	function checkResult() {
		console.log("checking...");
		const evaluation = EVALUATION_FUNCTIONS[question.type](
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			question as any,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			answer as any
		);
		console.log("question", question);
		console.log("answer", answer);
		console.log("evaluation", evaluation);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		setEvaluation(evaluation as any);
	}

	if (!currentEvaluation) {
		<span className="text-red-500">No question state found for this question.</span>;
	}

	return (
		<button className="btn-primary" onClick={checkResult} disabled={!!currentEvaluation}>
			Überprüfen
		</button>
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
