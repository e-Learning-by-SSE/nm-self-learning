import { CheckCircleIcon } from "@heroicons/react/solid";
import { motion } from "framer-motion";
import { MDXRemote } from "next-mdx-remote";
import { PropsWithChildren } from "react";
import { useQuestion } from "../../use-question-hook";
import { MultipleChoiceAnswer, MultipleChoiceEvaluation, MultipleChoiceQuestion } from "./schema";

export function MultipleChoiceAnswer() {
	const { question, setAnswer, answer, markdown, evaluation } = useQuestion<
		MultipleChoiceQuestion,
		MultipleChoiceAnswer,
		MultipleChoiceEvaluation
	>();

	if (!answer.value) {
		setAnswer(a => ({ ...a, value: {} }));
		return;
	}

	return (
		<div className="flex flex-col gap-4">
			{question.answers?.map(option => (
				<MultipleChoiceOption
					key={option.answerId}
					showResult={!!evaluation}
					isUserAnswerCorrect={evaluation?.answers[option.answerId] === true}
					isCorrect={option.isCorrect}
					isSelected={answer.value[option.answerId] === true}
					onToggle={() =>
						setAnswer(old => ({
							...old,
							value: {
								...old.value,
								[option.answerId]:
									old.value[option.answerId] === true ? false : true
							}
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
	showResult,
	isSelected,
	isUserAnswerCorrect,
	isCorrect,
	onToggle
}: PropsWithChildren<{
	showResult: boolean;
	isSelected: boolean;
	isCorrect: boolean;
	isUserAnswerCorrect: boolean;
	onToggle: () => void;
}>) {
	let className = "bg-white";

	if (!showResult && isSelected) {
		className = "bg-secondary text-white";
	}

	if (showResult) {
		if (isUserAnswerCorrect) {
			if (isCorrect) {
				className = "bg-green-500 text-white";
			} else {
				className = "bg-green-50";
			}
		} else {
			if (isCorrect) {
				className = "bg-green-200";
			} else {
				className = isSelected ? "bg-red-500 text-white" : "bg-red-200";
			}
		}
	}

	return (
		<button
			className={`relative flex w-full flex-col rounded-lg border px-4 py-4 text-left transition-colors duration-500 focus:ring-0 focus-visible:outline-secondary ${className}`}
			onClick={onToggle}
			disabled={showResult}
		>
			{children} {isCorrect ? "correct" : "incorrect"}
			{showResult && (
				<motion.span
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5 }}
					className="absolute right-2"
				>
					{isSelected && (
						<CheckCircleIcon className="h-6 rounded-full bg-white text-secondary" />
					)}
				</motion.span>
			)}
		</button>
	);
}
