import { LessonType } from "@prisma/client";
import {
	calculateAverageScore,
	QuizCompletionDialog,
	QuizFailedDialog,
	useMarkAsCompleted
} from "@self-learning/completion";
import {
	ChapterName,
	getCourse,
	LessonData,
	useLessonContext,
	useLessonSession
} from "@self-learning/lesson";
import { MdLookup, MdLookupArray } from "@self-learning/markdown";
import { QuizContent } from "@self-learning/question-types";
import {
	defaultQuizConfig,
	Question,
	QuestionTab,
	Quiz,
	QuizProvider,
	useQuiz
} from "@self-learning/quiz";
import { ResolvedValue } from "@self-learning/types";
import { LoadingBox, Tab, Tabs, useIsFirstRender } from "@self-learning/ui/common";
import { useEventLog } from "@self-learning/util/eventlog";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";

export type QuestionProps = {
	lesson: LessonData;
	course?: ResolvedValue<typeof getCourse>;
	quiz: Quiz;
	markdown: {
		questionsMd: MdLookup;
		answersMd: MdLookup;
		hintsMd: MdLookupArray;
	};
};

export function QuizLearnersView({ course, lesson, quiz, markdown }: QuestionProps) {
	const { questions, config } = quiz;
	const [currentQuestion, setCurrentQuestion] = useState(questions[0]);
	const router = useRouter();
	const { index } = router.query;
	const [nextIndex, setNextIndex] = useState(1);
	const { lessonAttemptId, submit, reset, setTrackingState } = useLessonSession(
		lesson.lessonId,
		course?.courseId ?? "undefined"
	);
	const isStandalone = !course;

	const getQuestionUrl = useCallback(
		(index: number) => {
			return isStandalone
				? `/lessons/${lesson.slug}/quiz?index=${index}`
				: `/courses/${course.slug}/${lesson.slug}/quiz?index=${index}`;
		},
		[isStandalone, course?.slug, lesson.slug]
	);

	const goToNextQuestion = useCallback(() => {
		router.push(getQuestionUrl(nextIndex), undefined, { shallow: true });
	}, [nextIndex, router, getQuestionUrl]);

	function goToQuestion(index: number) {
		router.push(getQuestionUrl(index), undefined, { shallow: true });
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
						courseId={course?.courseId}
					/>

					{!isStandalone && (
						<QuizCompletionStateSubscriber
							lesson={lesson}
							course={course}
							onSubmitAttempt={submit}
							setTrackingState={setTrackingState}
						/>
					)}
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
	course: NonNullable<QuestionProps["course"]>;
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
	const { evaluations, completionState, lessonAttemptId } = useQuiz();
	const { newEvent } = useEventLog();
	const [suppressDialog, setSuppressDialog] = useState(false);

	const { nextLesson } = useLessonContext(lesson.lessonId, course?.slug ?? "");

	const isStandalone = !course;
	const lessonUrl = isStandalone
		? `/lessons/${lesson.slug}`
		: `/courses/${course.slug}/${lesson.slug}`;

	// we need to reset the warning dialog when the quiz is in progress since the user can retry and
	// the state is kept in this case
	if (completionState === "in-progress" && suppressDialog) {
		setSuppressDialog(false);
	}

	const showSuccessDialog = completionState === "completed" && !suppressDialog;
	const showFailureDialog = completionState === "failed" && !suppressDialog;

	const logQuizStart = useCallback(
		(lesson: QuestionProps["lesson"], question: QuizContent[number]) => {
			newEvent({
				type: "LESSON_QUIZ_START",
				courseId: course?.courseId,
				resourceId: lesson.lessonId,
				payload: {
					questionId: question.questionId,
					type: question.type,
					lessonAttemptId: lessonAttemptId
				}
			});
		},
		[newEvent, course?.courseId, lessonAttemptId]
	);

	const isFirstRender = useIsFirstRender();
	useEffect(() => {
		if (!isFirstRender) return;
		void logQuizStart(lesson, questions[currentIndex]);
	}, [currentIndex, isFirstRender, lesson, logQuizStart, questions]);

	return (
		<div className="flex flex-col gap-4">
			<div className="relative flex flex-col gap-2">
				{!isStandalone && <ChapterName course={course} lesson={lesson} />}

				<Link href={lessonUrl}>
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

			{showSuccessDialog && !isStandalone && (
				<QuizCompletionDialog
					course={course}
					lesson={lesson}
					onClose={() => {
						setSuppressDialog(true);
					}}
					nextLesson={nextLesson}
				/>
			)}
			{showFailureDialog && !isStandalone && (
				<QuizFailedDialog
					course={course}
					lesson={lesson}
					onClose={() => {
						setSuppressDialog(true);
					}}
					nextLesson={nextLesson}
				/>
			)}
		</div>
	);
}
