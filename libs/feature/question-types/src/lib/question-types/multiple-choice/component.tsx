import { useTranslation } from "next-i18next";
import { useQuiz } from "@self-learning/quiz";
import { MarkdownContainer } from "@self-learning/ui/layouts";
import { MarkdownRemote as MDXRemote } from "@self-learning/markdown";
import { PropsWithChildren } from "react";
import { Feedback } from "../../feedback";
import { useQuestion } from "../../use-question-hook";
import { LessonLayoutProps } from "@self-learning/lesson";
import { LessonType } from "@prisma/client";

export default function MultipleChoiceAnswer({ lesson }: { lesson: LessonLayoutProps["lesson"] }) {
	const { t } = useTranslation("feature-question-types");
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
							<span className="text-c-danger">{t("Missing_Answer_Content")}</span>
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
	const { t } = useTranslation("feature-question-types");
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
					<div className="py-1">{t("Justify_Answer")}</div>
					<textarea
						className="w-full"
						placeholder={t("Justification_Placeholder")}
					></textarea>
				</div>
			)}
		</div>
	);
}
