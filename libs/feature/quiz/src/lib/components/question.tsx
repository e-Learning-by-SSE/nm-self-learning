import type { CompiledMarkdown, MdLookup, MdLookupArray } from "@self-learning/markdown";
import { MDXRemote } from "next-mdx-remote";
import {
	createContext,
	Dispatch,
	PropsWithChildren,
	SetStateAction,
	useContext,
	useState
} from "react";
import { Certainty } from "./certainty";
import { ClozeAnswer, ClozeQuestion } from "./cloze";
import { Hints } from "./hints";
import { MultipleChoiceAnswer, MultipleChoiceQuestion } from "./multiple-choice";
import { ShortTextAnswer, ShortTextQuestion } from "./short-text";
import { TextAnswer, TextQuestion } from "./text";

export type QuestionType =
	| MultipleChoiceQuestion
	| ShortTextQuestion
	| TextQuestion
	| ClozeQuestion;

export const AnswerContext = createContext(
	null as unknown as {
		question: QuestionType;
		answer: Record<string, unknown>;
		setAnswer: Dispatch<SetStateAction<Record<string, unknown>>>;
	}
);

export function AnswerContextProvider({
	children,
	question
}: PropsWithChildren<{ question: QuestionType }>) {
	const [answer, setAnswer] = useState<Record<string, unknown>>({});

	const value = {
		question,
		answer,
		setAnswer
	};

	return <AnswerContext.Provider value={value}>{children}</AnswerContext.Provider>;
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
	const [usedHints, setUsedHints] = useState<CompiledMarkdown[]>([]);
	const hintsAvailable =
		question.hints && !question.hints.disabled && question.hints.content.length > 0;
	const allHints = markdown.hintsMd[question.questionId] ?? [];

	function useHint() {
		const nextHintIndex = usedHints.length;

		if (nextHintIndex < allHints.length) {
			const nextHint = markdown.hintsMd[question.questionId][nextHintIndex];
			setUsedHints(prev => [...prev, nextHint]);
		}
	}

	return (
		<AnswerContextProvider question={question}>
			<div className="max-w-full">
				<CheckResult />

				<div className="mb-1 font-semibold text-secondary">{question.type}</div>

				<div className="flex flex-col">
					{markdown.questionsMd[question.questionId] ? (
						<div className="prose max-w-full">
							<MDXRemote {...markdown.questionsMd[question.questionId]} />
						</div>
					) : (
						<span className="text-red-500">Error: No markdown content found.</span>
					)}

					<div className="prose mt-8 flex max-w-full flex-col gap-8">
						<Answer question={question} answersMd={markdown.answersMd} />
					</div>

					{question.withCertainty && (
						<div className="mt-8">
							<Certainty />
						</div>
					)}

					{hintsAvailable && (
						<div className="mt-8">
							<Hints
								totalHintsCount={allHints.length}
								usedHints={usedHints}
								useHint={useHint}
							/>
						</div>
					)}
				</div>
			</div>
		</AnswerContextProvider>
	);
}

function CheckResult() {
	const { answer } = useContext(AnswerContext);

	function checkResult() {
		console.log("checking...");
		console.log(answer);
	}

	return (
		<button className="btn-primary mb-8 w-full" onClick={checkResult}>
			Überprüfen
		</button>
	);
}

function Answer({ question, answersMd }: { question: QuestionType; answersMd: MdLookup }) {
	if (question.type === "multiple-choice") {
		return <MultipleChoiceAnswer answersMd={answersMd} />;
	}

	if (question.type === "short-text") {
		return <ShortTextAnswer />;
	}

	if (question.type === "text") {
		return <TextAnswer />;
	}

	if (question.type === "cloze") {
		return <ClozeAnswer textArray={question.textArray} />;
	}

	return (
		<span className="text-red-500">
			Error: No implementation found for "{(question as { type: string }).type}".
		</span>
	);
}
