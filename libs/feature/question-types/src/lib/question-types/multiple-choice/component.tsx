import { MultipleChoiceQuestion } from "@self-learning/types";
import { MDXRemote } from "next-mdx-remote";
import { PropsWithChildren } from "react";
import { useQuestion } from "../../use-question-hook";

export function MultipleChoiceAnswer() {
	const { question, setAnswer, answer, markdown } = useQuestion<MultipleChoiceQuestion>();

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
					{markdown.answersMd[option.answerId] ? (
						<MDXRemote {...markdown.answersMd[option.answerId]} />
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
			className={`flex w-full flex-col rounded-lg border px-4 py-4 text-left transition-colors focus:ring-0 focus-visible:outline-secondary ${
				isSelected
					? "border-indigo-200 bg-indigo-500 text-white focus-visible:outline-yellow-500 prose-headings:text-white prose-a:text-white"
					: "border-slate-200 bg-white"
			}`}
			onClick={onToggle}
		>
			{children}
		</button>
	);
}
