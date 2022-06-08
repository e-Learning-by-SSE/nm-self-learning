import { MdLookup } from "@self-learning/markdown";
import { MDXRemote } from "next-mdx-remote";
import { ReactElement, useContext } from "react";
import { BaseQuestion } from "./base-question";
import { AnswerContext } from "./question";

export type MultipleChoiceQuestion = BaseQuestion & {
	type: "multiple-choice";
	answers: {
		answerId: string;
		content: string;
		isCorrect: boolean;
	}[];
};

export function MultipleChoiceAnswer({ answersMd }: { answersMd: MdLookup }) {
	const { question } = useContext(AnswerContext);

	return (
		<div className="flex flex-col gap-4">
			{question.answers?.map(answer => (
				<MultipleChoiceOption
					key={answer.answerId}
					answerId={answer.answerId}
					content={
						answersMd[answer.answerId] ? (
							<MDXRemote {...answersMd[answer.answerId]} />
						) : (
							<span className="text-red-500">Error: No markdown content found.</span>
						)
					}
				/>
			))}
		</div>
	);
}

function MultipleChoiceOption({ content, answerId }: { content: ReactElement; answerId: string }) {
	const { answer, setAnswer } = useContext(AnswerContext);

	function toggleAnswer() {
		setAnswer(old => ({ ...old, [answerId]: old[answerId] === true ? false : true }));
	}

	return (
		<button
			className={`flex w-full flex-col rounded-lg border px-4 py-1 text-left transition-colors ${
				answer[answerId] === true
					? "border-indigo-200 bg-indigo-500 text-white prose-headings:text-white prose-a:text-white"
					: "border-slate-200 bg-white"
			}`}
			onClick={toggleAnswer}
		>
			{content}
		</button>
	);
}
