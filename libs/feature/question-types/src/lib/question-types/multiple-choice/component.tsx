import { MarkdownContainer } from "@self-learning/ui/layouts";
import { MDXRemote } from "next-mdx-remote";
import { PropsWithChildren } from "react";
import { useQuestion } from "../../use-question-hook";

export function MultipleChoiceAnswer() {
	const { question, setAnswer, answer, markdown, evaluation } = useQuestion("multiple-choice");

	return (
		<div className="flex flex-col gap-4">
			{question.answers?.map(option => (
				<MultipleChoiceOption
					key={option.answerId}
					showResult={!!evaluation}
					isUserAnswerCorrect={evaluation?.answers[option.answerId] === true}
					isCorrect={option.isCorrect}
					isSelected={answer.value[option.answerId] === true}
					onToggle={() => {
						console.log("onToggle");
						setAnswer(old => ({
							...old,
							value: {
								...old.value,
								[option.answerId]:
									old.value[option.answerId] === true ? false : true
							}
						}));
					}}
				>
					{markdown.answersMd[option.answerId] ? (
						<MarkdownContainer>
							<MDXRemote {...markdown.answersMd[option.answerId]} />
						</MarkdownContainer>
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
	showResult,
	isSelected,
	isUserAnswerCorrect,
	onToggle
}: PropsWithChildren<{
	showResult: boolean;
	isSelected: boolean;
	isCorrect: boolean;
	isUserAnswerCorrect: boolean;
	onToggle: () => void;
}>) {
	let className = "bg-white";

	if (showResult) {
		className = isUserAnswerCorrect
			? "bg-green-50 border-emerald-500"
			: "bg-red-50 border-red-500";
	}

	return (
		<button
			className={`flex gap-8 rounded-lg border border-light-border bg-white px-8 py-2 text-start focus:outline-secondary ${className}`}
			onClick={onToggle}
			disabled={showResult}
		>
			<input
				type={"checkbox"}
				checked={isSelected}
				onChange={() => {
					/** Bubbles up to button click. */
				}}
				disabled={showResult}
				className="self-center rounded text-secondary accent-secondary focus:ring-secondary"
			/>
			{children}
		</button>
	);
}
