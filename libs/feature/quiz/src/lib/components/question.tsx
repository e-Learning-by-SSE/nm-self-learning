import { CheckCircleIcon, ArrowPathIcon } from "@heroicons/react/24/solid";
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
import {
	CheckCircleIcon as CheckCircleIconOutline,
	XCircleIcon
} from "@heroicons/react/24/outline";
import { useEventLog } from "@self-learning/util/eventlog";

export type QuizSavedAnswers = { answers: unknown; lessonSlug: string };

export function Question({
	question,
	markdown,
	lesson,
	courseId
}: {
	question: QuestionType;
	markdown: {
		questionsMd: MdLookup;
		answersMd: MdLookup;
		hintsMd: MdLookupArray;
	};
	lesson: LessonLayoutProps["lesson"];
	courseId?: string;
}) {
	const {
		goToNextQuestion,
		answers,
		setAnswers,
		evaluations,
		setEvaluations,
		config,
		attempts,
		setAttempts,
		lessonAttemptId
	} = useQuiz();
	const { newEvent } = useEventLog();
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

	async function setEvaluation(e: BaseEvaluation | null) {
		setCurrentStep(
			question.type === "multiple-choice" && lesson.lessonType === LessonType.SELF_REGULATED
				? 2
				: 1
		);
		setEvaluations(prev => ({
			...prev,
			[question.questionId]: e
		}));
		// no event on "Reset" click
		if (e) {
			setAttempts(prev => {
				const attempts = prev[question.questionId];
				const newAttempts = attempts + 1;
				void newEvent({
					type: "LESSON_QUIZ_SUBMISSION",
					resourceId: lesson.lessonId,
					courseId: courseId,
					payload: {
						questionId: question.questionId,
						totalQuestionPool: totalSteps,
						questionPoolIndex: currentStep,
						type: question.type,
						hintsUsed: question.hints?.map(hint => hint.hintId) ?? "",
						attempts: newAttempts,
						solved: e.isCorrect ?? false,
						lessonAttemptId
					}
				});
				return { ...prev, [question.questionId]: newAttempts };
			});
		}
	}

	function nextQuestionStep() {
		if (currentStep < totalSteps) {
			setCurrentStep(currentStep + 1);
		} else {
			goToNextQuestion();
		}
		void newEvent({
			type: "LESSON_QUIZ_START",
			resourceId: lesson.lessonId,
			courseId: courseId,
			payload: {
				questionId: question.questionId,
				type: question.type,
				lessonAttemptId
			}
		});
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
	setEvaluation,
	nextQuestionStep,
	isLastQuestionStep
}: {
	setEvaluation: (ev: { isCorrect: boolean } | null) => void;
	nextQuestionStep: () => void;
	isLastQuestionStep: boolean;
}) {
	// We only use "multiple-choice" to get better types ... works for all question types
	const { question, answer, evaluation: currentEvaluation } = useQuestion("multiple-choice");
	const { completionState, reload } = useQuiz();

	async function checkResult() {
		console.debug("checking...");
		const evaluation = EVALUATION_FUNCTIONS[question.type](question, answer);
		setEvaluation(evaluation);
		//here?
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

export function QuestionTab(props: {
	evaluation: { isCorrect: boolean } | null;
	index: number;
	isMultiStep: boolean;
}) {
	const isCorrect = props.evaluation?.isCorrect === true;
	const isIncorrect = props.evaluation?.isCorrect === false;

	{
		props.isMultiStep && <CheckCircleIcon className="h-5 text-secondary" />;
	}

	return (
		<span className="flex items-center gap-4">
			{isCorrect ? (
				<QuestionTabIcon isMultiStep={props.isMultiStep}>
					<CheckCircleIcon className="h-5 text-secondary" />
				</QuestionTabIcon>
			) : isIncorrect ? (
				<QuestionTabIcon isMultiStep={props.isMultiStep}>
					<XCircleIcon className="h-5 text-red-500" />
				</QuestionTabIcon>
			) : (
				<QuestionTabIcon isMultiStep={props.isMultiStep}>
					<CheckCircleIconOutline className="h-5 text-gray-400" />
				</QuestionTabIcon>
			)}
			<span data-testid="questionTab">Aufgabe {props.index + 1}</span>
		</span>
	);
}

function QuestionTabIcon({
	children,
	isMultiStep
}: {
	children: React.ReactNode;
	isMultiStep: boolean;
}) {
	return isMultiStep ? (
		<div className="flex overflow-hidden">
			{children}
			{children}
		</div>
	) : (
		<div>{children}</div>
	);
}
