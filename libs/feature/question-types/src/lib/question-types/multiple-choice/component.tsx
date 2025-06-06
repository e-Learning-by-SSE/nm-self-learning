import { useQuiz } from "@self-learning/quiz";
import { MarkdownContainer } from "@self-learning/ui/layouts";
import { MDXRemote } from "next-mdx-remote";
import { PropsWithChildren, useState } from "react";
import { Feedback } from "../../feedback";
import { useQuestion } from "../../use-question-hook";
import { LessonLayoutProps } from "@self-learning/lesson";
import { LessonType } from "@prisma/client";

export default function MultipleChoiceAnswer({
	questionStep,
	lesson
}: {
	questionStep: number;
	lesson: LessonLayoutProps["lesson"];
}) {
	const { question, setAnswer, answer, markdown, evaluation } = useQuestion("multiple-choice");
	const [justifiedAnswer, setJustifiedAnswer] = useState(JSON.parse(JSON.stringify(answer)));
	const { config } = useQuiz();

	const isJustified = questionStep === 1 && lesson.lessonType === LessonType.SELF_REGULATED;

	return (
		<>
			<section className="flex flex-col gap-4">
			{Object.entries(answer.value).map(([answerId]) => (
					<MultipleChoiceOption
						key={answerId}
						disabled={!!evaluation}
						showResult={!!evaluation && config.showSolution}
						isUserAnswerCorrect={evaluation?.answers[answerId] === true}
						isCorrect={question.answers.find(a => a.answerId === answerId)?.isCorrect ?? false}
						isSelected={
							(isJustified ? justifiedAnswer : answer).value[answerId] === true
						}
						onToggle={() => {
							const answerSetter = isJustified ? setJustifiedAnswer : setAnswer;
							answerSetter(old => ({
								...old,
								value: {
									...old.value,
									[answerId]: old.value[answerId] !== true
								}
							}));
						}}
						justifyChoice={isJustified}
					>
						{markdown.answersMd[answerId] ? (
							<MarkdownContainer>
								<MDXRemote {...markdown.answersMd[answerId]} />
							</MarkdownContainer>
						) : (
							<span className="text-red-500">Error: No markdown content found.</span>
						)}
					</MultipleChoiceOption>
				))}
			</section>

			{evaluation && <Feedback isCorrect={evaluation.isCorrect} />}
		</>
	);
}

export function MultipleChoiceOption({
	children,
	showResult,
	isSelected,
	isUserAnswerCorrect,
	onToggle,
	disabled,
	justifyChoice
}: PropsWithChildren<{
	showResult: boolean;
	isSelected: boolean;
	isCorrect: boolean;
	isUserAnswerCorrect: boolean;
	disabled: boolean;
	justifyChoice: boolean;
	onToggle: () => void;
}>) {
	let className = "bg-white";

	if (showResult) {
		className = isUserAnswerCorrect
			? "bg-emerald-50 border-emerald-500"
			: "bg-red-50 border-red-500";
	}

	if (justifyChoice) {
		return (
			<div className="rounded-lg border border-light-border bg-white">
				<button
					className={`flex w-full gap-8 rounded-t-lg border-b border-light-border py-2 px-8 text-start focus:outline-secondary ${className}`}
					onClick={onToggle}
					disabled={disabled}
					data-testid="MultipleChoiceOption"
				>
					<input
						type={"checkbox"}
						checked={isSelected}
						onChange={() => {
							/** Bubbles up to button click. */
						}}
						disabled={disabled}
						className="checkbox self-center"
					/>
					{children}
				</button>
				<div className="rounded-b-lg py-2 px-8">
					<div className="py-1">Bitte Begründe deine Antwort:</div>
					<textarea className="w-full" placeholder="Begründung..."></textarea>
				</div>
			</div>
		);
	}

	return (
		<button
			className={`flex gap-8 rounded-lg border border-light-border bg-white px-8 py-2 text-start focus:outline-secondary ${className}`}
			onClick={onToggle}
			disabled={disabled}
			data-testid="MultipleChoiceOption"
		>
			<input
				type={"checkbox"}
				checked={isSelected}
				onChange={() => {
					/** Bubbles up to button click. */
				}}
				disabled={disabled}
				className="checkbox self-center"
			/>
			{children}
		</button>
	);
}
