import { useQuiz } from "@self-learning/quiz";
import { MarkdownContainer } from "@self-learning/ui/layouts";
import { MDXRemote } from "next-mdx-remote";
import { PropsWithChildren } from "react";
import { Feedback } from "../../feedback";
import { useQuestion } from "../../use-question-hook";
import { LessonLayoutProps } from "@self-learning/lesson";
import { LessonType } from "@prisma/client";

export default function MultipleChoiceAnswer({ lesson }: { lesson: LessonLayoutProps["lesson"] }) {
	const { question, setAnswer, answer, markdown, evaluation } = useQuestion("multiple-choice");
	const { config } = useQuiz();
	const isJustified = lesson.lessonType === LessonType.SELF_REGULATED;

	return (
		<>
			<section className="flex flex-col gap-4">
				{Object.entries(answer.value).map(([answerId]) => (
					<MultipleChoiceOption
						key={answerId}
						disabled={!!evaluation}
						showResult={!!evaluation && config.showSolution}
						isUserAnswerCorrect={evaluation?.answers[answerId] === true}
						isCorrect={
							question.answers.find(a => a.answerId === answerId)?.isCorrect ?? false
						}
						isSelected={answer.value[answerId] === true}
						justified={isJustified}
						onToggle={() => {
							const answerSetter = setAnswer;
							answerSetter(old => ({
								...old,
								value: {
									...old.value,
									[answerId]: old.value[answerId] !== true
								}
							}));
						}}
					>
						{markdown.answersMd[answerId] ? (
							<MarkdownContainer>
								<MDXRemote {...markdown.answersMd[answerId]} />
							</MarkdownContainer>
						) : (
							<span className="text-c-danger">Error: No markdown content found.</span>
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
	justified
}: PropsWithChildren<{
	showResult: boolean;
	isSelected: boolean;
	isCorrect: boolean;
	isUserAnswerCorrect: boolean;
	disabled: boolean;
	justified: boolean;
	onToggle: () => void;
}>) {
	let className = "bg-white";

	if (showResult) {
		className = isUserAnswerCorrect
			? "bg-c-primary-subtle border-c-primary"
			: "bg-c-danger-subtle";
	}

	const justifiedLayout = justified ? "border-b border-c-border rounded-t-lg" : "rounded-lg";

	return (
		<div className="rounded-lg border border-c-border bg-white">
			<button
				className={`w-full flex gap-8 px-8 py-2 text-start focus:outline-c-primary ${className} ${justifiedLayout}`}
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
			{justified && (
				<div className="rounded-b-lg py-2 px-8">
					<div className="py-1">Bitte Begründe deine Antwort:</div>
					<textarea className="w-full" placeholder="Begründung..."></textarea>
				</div>
			)}
		</div>
	);
}
