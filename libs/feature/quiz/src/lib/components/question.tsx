import type { CompiledMarkdown, MdLookup, MdLookupArray } from "@self-learning/markdown";
import {
	AnswerContextProvider,
	ClozeAnswer,
	EVALUATION_FUNCTIONS,
	MultipleChoiceAnswer,
	ProgrammingAnswer,
	QuestionType,
	ShortTextAnswer,
	TextAnswer,
	useQuestion,
	VorwissenAnswer
} from "@self-learning/question-types";
import { MDXRemote } from "next-mdx-remote";
import { Dispatch, SetStateAction, useState } from "react";
import { Certainty } from "./certainty";
import { Hints } from "./hints";

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
	const [showResult, setShowResult] = useState(false);
	const [usedHints, setUsedHints] = useState<CompiledMarkdown[]>([]);
	const hintsAvailable = question.hints && question.hints.length > 0;
	const allHints = markdown.hintsMd[question.questionId] ?? [];

	function useHint() {
		const nextHintIndex = usedHints.length;

		if (nextHintIndex < allHints.length) {
			const nextHint = markdown.hintsMd[question.questionId][nextHintIndex];
			setUsedHints(prev => [...prev, nextHint]);
		}
	}

	return (
		<AnswerContextProvider question={question} markdown={markdown} showResult={showResult}>
			<div className="max-w-full">
				<div className="flex gap-4">
					<button className="btn-stroked h-fit" onClick={() => setShowResult(v => !v)}>
						Toggle
					</button>
					<CheckResult setShowResult={setShowResult} />
				</div>

				<div className="mb-1 font-semibold text-secondary">{question.type}</div>

				<div className="flex flex-col">
					{markdown.questionsMd[question.questionId] ? (
						<div className="prose max-w-full">
							<MDXRemote {...markdown.questionsMd[question.questionId]} />
						</div>
					) : (
						<span className="text-red-500">Error: No markdown content found.</span>
					)}

					<div className="mt-8 flex max-w-full flex-col gap-8">
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

function CheckResult({ setShowResult }: { setShowResult: Dispatch<SetStateAction<boolean>> }) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const { question, answer, setEvaluation } = useQuestion();

	function checkResult() {
		console.log("checking...");
		const evaluation = EVALUATION_FUNCTIONS[question.type as QuestionType["type"]](question, {
			type: question.type,
			value: answer
		} as any);
		console.log(evaluation);
		setEvaluation(evaluation);
		setShowResult(true);
	}

	return (
		<button className="btn-primary mb-8 w-full" onClick={checkResult}>
			Überprüfen
		</button>
	);
}

function Answer({ question, answersMd }: { question: QuestionType; answersMd: MdLookup }) {
	if (question.type === "multiple-choice") {
		return <MultipleChoiceAnswer />;
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

	if (question.type === "vorwissen") {
		return <VorwissenAnswer question={question} />;
	}

	if (question.type === "programming") {
		return <ProgrammingAnswer question={question} />;
	}

	return (
		<span className="text-red-500">
			Error: No implementation found for "{(question as { type: string }).type}".
		</span>
	);
}
