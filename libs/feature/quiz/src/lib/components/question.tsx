import { ArrowPathIcon } from "@heroicons/react/24/solid";
import type { MdLookup, MdLookupArray } from "@self-learning/markdown";
import {
	AnswerContextProvider,
	BaseEvaluation,
	EVALUATION_FUNCTIONS,
	QUESTION_TYPE_DISPLAY_NAMES,
	QuestionAnswerRenderer,
	QuestionType,
	useQuestion
} from "@self-learning/question-types";
import { MarkdownContainer } from "@self-learning/ui/layouts";
import { MDXRemote } from "next-mdx-remote";
import { Hints } from "./hints";
import { useQuiz } from "./quiz-context";
import { LessonLayoutProps } from "@self-learning/lesson";
import { LessonType } from "@prisma/client";
import { useState } from "react";
import { useCookies } from "react-cookie";
import { useEventLog } from "@self-learning/util/common";

export type QuizSavedAnswers = { answers: unknown; lessonSlug: string };

export function Question({
	question,
	markdown,
	lesson
}: {
	question: QuestionType;
	markdown: {
		questionsMd: MdLookup;
		answersMd: MdLookup;
		hintsMd: MdLookupArray;
	};
	lesson: LessonLayoutProps["lesson"];
}) {
	const { goToNextQuestion, answers, setAnswers, evaluations, setEvaluations, config } =
		useQuiz();
	const answer = answers[question.questionId];
	const evaluation = evaluations[question.questionId];
	const [currentStep, setCurrentStep] = useState(
		evaluation?.isCorrect === true &&
			question.type === "multiple-choice" &&
			lesson.lessonType === LessonType.SELF_REGULATED
			? 2
			: 1
	);
	const totalSteps =
		question.type === "multiple-choice" && lesson.lessonType === LessonType.SELF_REGULATED
			? 2
			: 1;

	const [_, setCookie] = useCookies(["quiz_answers_save"]);

	function setAnswer(v: unknown) {
		const value = typeof v === "function" ? v(answer) : v;

		setAnswers(prev => {
			const updatedAnswers = {
				...prev,
				[question.questionId]: value
			};
			const cookieContent: QuizSavedAnswers = {
				answers: updatedAnswers,
				lessonSlug: lesson.slug
			};
			setCookie(`quiz_answers_save`, JSON.stringify(cookieContent), { path: "/" });
			return updatedAnswers;
		});
	}

	function setEvaluation(e: BaseEvaluation | null) {
		setCurrentStep(
			question.type === "multiple-choice" && lesson.lessonType === LessonType.SELF_REGULATED
				? 2
				: 1
		);
		setEvaluations(prev => ({
			...prev,
			[question.questionId]: e
		}));
	}

	function nextQuestionStep() {
		if (currentStep < totalSteps) {
			setCurrentStep(currentStep + 1);
		} else {
			goToNextQuestion();
		}
	}

	return (
		<AnswerContextProvider
			question={question}
			answer={answer}
			setAnswer={setAnswer}
			markdown={markdown}
			evaluation={evaluation}
			setEvaluation={setEvaluation}
		>
			<article className="flex flex-col gap-8">
				<div>
					<div className="flex items-center justify-between">
						<span className="font-semibold text-secondary" data-testid="questionType">
							{QUESTION_TYPE_DISPLAY_NAMES[question.type]}
						</span>
						<div className="flex gap-4">
							<button
								className="btn-stroked h-fit"
								onClick={() => setEvaluation(null)}
							>
								Reset
							</button>
							<CheckResult
								lessonId={lesson.lessonId}
								setEvaluation={setEvaluation}
								nextQuestionStep={nextQuestionStep}
								isLastQuestionStep={currentStep === totalSteps}
							/>
						</div>
					</div>
					{markdown.questionsMd[question.questionId] ? (
						<MarkdownContainer>
							<MDXRemote {...markdown.questionsMd[question.questionId]} />
						</MarkdownContainer>
					) : (
						<span className="text-red-500">Error: No markdown content found.</span>
					)}
				</div>

				<div className="flex max-w-full flex-col gap-8">
					<QuestionAnswerRenderer
						question={question}
						lesson={lesson}
						questionStep={currentStep}
					/>
				</div>

				{/* {question.withCertainty && <Certainty />} */}

				{config.hints.enabled && <Hints />}
			</article>
		</AnswerContextProvider>
	);
}

function CheckResult({
	lessonId,
	setEvaluation,
	nextQuestionStep,
	isLastQuestionStep
}: {
	lessonId: string;
	setEvaluation: (ev: { isCorrect: boolean } | null) => void;
	nextQuestionStep: () => void;
	isLastQuestionStep: boolean;
}) {
	// We only use "multiple-choice" to get better types ... works for all question types
	const { question, answer, evaluation: currentEvaluation } = useQuestion("multiple-choice");
	const { completionState, reload } = useQuiz();
	const { newEvent: writeEvent } = useEventLog();

	async function checkResult() {
		console.debug("checking...");
		const evaluation = EVALUATION_FUNCTIONS[question.type](question, answer);
		setEvaluation(evaluation);
		await writeEvent({
			action: "LESSON_QUIZ_SUBMISSION",
			resourceId: lessonId,
			payload: {
				index: question.questionId,
				type: question.type,
				hintsUsed: question.hints?.map(hint => hint.hintId) ?? "",
				attempts: 1,
				solved: evaluation?.isCorrect
			}
		});
	}
	if (!currentEvaluation) {
		<span className="text-red-500">No question state found for this question.</span>;
	}

	const canGoToNextQuestion = currentEvaluation || !isLastQuestionStep;

	const renderInProgressButton = () => (
		<button
			className="btn-primary"
			onClick={canGoToNextQuestion ? nextQuestionStep : checkResult}
		>
			{canGoToNextQuestion ? "Nächste Frage" : "Überprüfen"}
		</button>
	);

	const renderFailedButton = () => (
		<button className="btn bg-red-500" onClick={reload}>
			<span>Erneut probieren</span>
			<ArrowPathIcon className="h-5" />
		</button>
	);

	const returnButton = {
		"in-progress": renderInProgressButton(),
		failed: renderFailedButton(),
		completed: null
	};
	return returnButton[completionState];
}
