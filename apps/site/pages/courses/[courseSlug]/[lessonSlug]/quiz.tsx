import {
	CheckCircleIcon as CheckCircleIconOutline,
	XCircleIcon
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { LessonType } from "@prisma/client";
import { withAuth } from "@self-learning/api";
import {
	QuizCompletionDialog,
	QuizFailedDialog,
	useMarkAsCompleted
} from "@self-learning/completion";
import {
	getStaticPropsForLayout,
	LessonLayout,
	LessonLayoutProps,
	useLessonContext,
	useLessonSession
} from "@self-learning/lesson";
import { compileMarkdown, MdLookup, MdLookupArray } from "@self-learning/markdown";
import { QuizContent } from "@self-learning/question-types";
import { defaultQuizConfig, Question, Quiz, QuizProvider, useQuiz } from "@self-learning/quiz";
import { LoadingBox, Tab, Tabs, useIsFirstRender } from "@self-learning/ui/common";
import { useEventLog } from "@self-learning/util/eventlog";
import { calculateAverageScore } from "libs/feature/completion/src/lib/lesson-grading";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useRef, useState } from "react";

type QuestionProps = LessonLayoutProps & {
	quiz: Quiz;
	markdown: {
		questionsMd: MdLookup;
		answersMd: MdLookup;
		hintsMd: MdLookupArray;
	};
};

// Cant use withTranslation hook for some reason. Test will fail otherwise.
export const getServerSideProps = withAuth<QuestionProps>(async ({ params, locale }) => {
	const parentProps = await getStaticPropsForLayout(params);

	if ("notFound" in parentProps) return { notFound: true };

	const quiz = parentProps.lesson.quiz as Quiz | null;
	if (!quiz) return { notFound: true };

	const questionsMd: MdLookup = {};
	const answersMd: MdLookup = {};
	const hintsMd: MdLookupArray = {};
	type QuestionList = typeof quiz.questions;
	const processedQuestions: QuestionList = [];

	for (const question of quiz.questions) {
		questionsMd[question.questionId] = await compileMarkdown(question.statement);

		if (question.hints?.length > 0) {
			hintsMd[question.questionId] = [];

			for (const hint of question.hints) {
				hintsMd[question.questionId].push(await compileMarkdown(hint.content));
			}
		}

		if (question.type === "multiple-choice") {
			for (const answer of question.answers) {
				answersMd[answer.answerId] = await compileMarkdown(answer.content);
			}
		}
		processedQuestions.push(question);
	}

	quiz.questions = processedQuestions;

	return {
		props: {
			...(await serverSideTranslations(locale ?? "en", ["common"])),
			...parentProps,
			quiz,
			markdown: {
				questionsMd,
				answersMd,
				hintsMd
			}
		}
	};
});

export default function QuestionsPage({ course, lesson, quiz, markdown }: QuestionProps) {
	const { questions, config } = quiz;
	const [currentQuestion, setCurrentQuestion] = useState(questions[0]);
	const router = useRouter();
	const { index } = router.query;
	const [nextIndex, setNextIndex] = useState(1);
	const { lessonAttemptId, submit, reset, setTrackingState } = useLessonSession(
		lesson.lessonId,
		course.courseId
	);

	const goToNextQuestion = useCallback(() => {
		router.push(`/courses/${course.slug}/${lesson.slug}/quiz?index=${nextIndex}`, undefined, {
			shallow: true
		});
	}, [nextIndex, course.slug, lesson.slug, router]);

	function goToQuestion(index: number) {
		router.push(`/courses/${course.slug}/${lesson.slug}/quiz?index=${index}`, undefined, {
			shallow: true
		});
	}

	useEffect(() => {
		const indexNumber = Number(index);

		if (Number.isFinite(indexNumber) && indexNumber < questions.length) {
			setCurrentQuestion(questions[indexNumber]);
			setNextIndex(Number(index) + 1);
		} else {
			setCurrentQuestion(questions[0]);
			setNextIndex(1);
		}
	}, [index, questions]);

	const restart = () => {
		router.reload();
		reset();
	};

	if (lessonAttemptId === null) return <LoadingBox />;
	return (
		<QuizProvider
			questions={questions}
			config={config ?? defaultQuizConfig}
			goToNextQuestion={goToNextQuestion}
			reload={restart}
			lessonAttemptId={lessonAttemptId}
		>
			<div className="flex w-full flex-col gap-4">
				<div className="flex w-full flex-col gap-4">
					<QuizHeader
						lesson={lesson}
						course={course}
						currentIndex={nextIndex - 1}
						goToQuestion={goToQuestion}
						questions={questions}
					/>
					<Question
						key={currentQuestion.questionId}
						question={currentQuestion}
						markdown={markdown}
						lesson={lesson}
						courseId={course.courseId}
					/>
					<QuizCompletionStateSubscriber
						lesson={lesson}
						course={course}
						onSubmitAttempt={submit}
						setTrackingState={setTrackingState}
					/>
				</div>
			</div>
		</QuizProvider>
	);
}

/** Component that listens to the `completionState` and marks lesson as completed, or logs the submission. */
function QuizCompletionStateSubscriber({
	lesson,
	course,
	onSubmitAttempt,
	setTrackingState
}: {
	lesson: QuestionProps["lesson"];
	course: QuestionProps["course"];
	onSubmitAttempt: (
		completionState: "completed" | "failed",
		performanceScore: number
	) => Promise<unknown>;
	setTrackingState: (state: boolean) => void;
}) {
	const { completionState, attempts, answers } = useQuiz();
	const unsubscribeRef = useRef(false);
	const markAsCompleted = useMarkAsCompleted();

	useEffect(() => {
		if (unsubscribeRef.current) return;

		const handleCompletion = async () => {
			const performanceScore = calculateAverageScore(attempts, answers);

			if (completionState !== "in-progress") {
				onSubmitAttempt(completionState, performanceScore);
				setTrackingState(false);
			}

			if (completionState === "completed") {
				unsubscribeRef.current = true;
				console.log("QuizCompletionSubscriber: Marking as completed");
				markAsCompleted({
					lessonId: lesson.lessonId,
					courseSlug: course.slug,
					performanceScore
				});
			}
		};

		void handleCompletion();
	}, [
		answers,
		attempts,
		completionState,
		course.slug,
		lesson.lessonId,
		markAsCompleted,
		onSubmitAttempt,
		setTrackingState
	]);

	return <></>;
}

QuestionsPage.getLayout = LessonLayout;

// exported for testing
export function QuizHeader({
	lesson,
	course,
	questions,
	currentIndex,
	goToQuestion
}: {
	lesson: QuestionProps["lesson"];
	course: QuestionProps["course"];
	currentIndex: number;
	questions: QuizContent;
	goToQuestion: (index: number) => void;
}) {
	const { chapterName, nextLesson } = useLessonContext(lesson.lessonId, course.slug);
	const { evaluations, completionState, lessonAttemptId } = useQuiz();
	const { newEvent } = useEventLog();
	const [suppressDialog, setSuppressDialog] = useState(false);

	// we need to reset the warning dialog when the quiz is in progress since the user can retry and
	// the state is kept in this case
	if (completionState === "in-progress" && suppressDialog) {
		setSuppressDialog(false);
	}

	const showSuccessDialog = completionState === "completed" && !suppressDialog;
	const showFailureDialog = completionState === "failed" && !suppressDialog;

	const logQuizStart = useCallback(
		(lesson: QuestionProps["lesson"], question: QuizContent[number]) => {
			return newEvent({
				type: "LESSON_QUIZ_START",
				courseId: course.courseId,
				resourceId: lesson.lessonId,
				payload: {
					questionId: question.questionId,
					type: question.type,
					lessonAttemptId
				}
			});
		},
		[newEvent, course.courseId, lessonAttemptId]
	);

	const isFirstRender = useIsFirstRender();
	useEffect(() => {
		if (!isFirstRender) return;
		void logQuizStart(lesson, questions[currentIndex]);
	}, [currentIndex, isFirstRender, lesson, logQuizStart, questions]);

	return (
		<div className="flex flex-col gap-4">
			<div className="relative flex flex-col gap-2">
				<span className="font-semibold text-secondary">{chapterName}</span>
				<Link href={`/courses/${course.slug}/${lesson.slug}`}>
					<h1 className="text-4xl">{lesson.title}</h1>
				</Link>
			</div>

			<Tabs onChange={goToQuestion} selectedIndex={currentIndex}>
				{questions.map((question, index) => (
					<div onClick={() => logQuizStart(lesson, question)} key={question.questionId}>
						<Tab>
							<QuestionTab
								index={index}
								evaluation={evaluations[question.questionId]}
								isMultiStep={
									lesson.lessonType === LessonType.SELF_REGULATED &&
									question.type === "multiple-choice"
								}
							/>
						</Tab>
					</div>
				))}
			</Tabs>

			{showSuccessDialog && (
				<QuizCompletionDialog
					course={course}
					lesson={lesson}
					nextLesson={nextLesson}
					onClose={() => {
						setSuppressDialog(true);
					}}
				/>
			)}

			{showFailureDialog && (
				<QuizFailedDialog
					course={course}
					lesson={lesson}
					nextLesson={nextLesson}
					onClose={() => {
						setSuppressDialog(true);
					}}
				/>
			)}
		</div>
	);
}

function QuestionTab(props: {
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
