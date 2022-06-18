import { MdLookup } from "@self-learning/markdown";
import { MDXRemote } from "next-mdx-remote";
import { PropsWithChildren, useContext } from "react";
import { AnswerContext } from "./question";

export function MultipleChoiceAnswer({ answersMd }: { answersMd: MdLookup }) {
	const { question, setAnswer, answer } = useContext(AnswerContext);

	return (
		<div className="flex flex-col gap-4">
			{question.answers?.map(option => (
				<MultipleChoiceOption
					key={option.answerId}
					isSelected={answer[option.answerId] === true}
					onToggle={() =>
						setAnswer(old => ({
							...old,
							[option.answerId]: old[option.answerId] === true ? false : true
						}))
					}
				>
					{answersMd[option.answerId] ? (
						<MDXRemote {...answersMd[option.answerId]} />
					) : (
						<span className="text-red-500">Error: No markdown content found.</span>
					)}
				</MultipleChoiceOption>
			))}
		</div>
	);
}

export function MultipleChoiceOption({
	children,
	isSelected,
	onToggle
}: PropsWithChildren<{
	isSelected: boolean;
	onToggle: () => void;
}>) {
	return (
		<button
			className={`flex w-full flex-col rounded-lg border px-4 py-4 text-left transition-colors ${
				isSelected
					? "border-indigo-200 bg-indigo-500 text-white prose-headings:text-white prose-a:text-white"
					: "border-slate-200 bg-white"
			}`}
			onClick={onToggle}
		>
			{children}
		</button>
	);
}
