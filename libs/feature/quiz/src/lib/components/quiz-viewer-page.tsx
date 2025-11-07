import { ArrowPathIcon, PlayIcon } from "@heroicons/react/24/solid";
import { useMarkAsCompleted } from "@self-learning/completion";
import { useLessonContext, ChapterName, LessonData, getCombinedSmallCourse } from "@self-learning/lesson";
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
import { Dialog, DialogActions, OnDialogCloseFn, Tab, Tabs } from "@self-learning/ui/common";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useEventLog } from "@self-learning/util/common";
import { ResolvedValue } from "@self-learning/types";

export type QuestionProps = {
	lesson: LessonData;
	course?: ResolvedValue<typeof getCombinedSmallCourse>;
	quiz: Quiz;
	markdown: {
		questionsMd: MdLookup;
		answersMd: MdLookup;
		hintsMd: MdLookupArray;
	};
};

export function QuizLearnersView({ course, lesson, quiz, markdown }: QuestionProps) {
	const { questionOrder, questions, config } = quiz;
	const [currentQuestion, setCurrentQuestion] = useState(questions[0]);
	const router = useRouter();
	const { index } = router.query;
	const [nextIndex, setNextIndex] = useState(1);

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

	return (
		<QuizProvider
			questions={questions}
			config={config ?? defaultQuizConfig}
			goToNextQuestion={goToNextQuestion}
			reload={router.reload}
		>
			<div className="flex w-full flex-col gap-4">
				<div className="flex w-full flex-col gap-4">
					<QuizHeader
						lesson={lesson}
						course={course}
						currentIndex={nextIndex - 1}
						goToQuestion={goToQuestion}
						questions={questions}
						questionOrder={questionOrder}
					/>

					<Question
						key={currentQuestion.questionId}
						question={currentQuestion}
						markdown={markdown}
						lesson={lesson}
						courseId={course?.courseId}
					/>

					{!isStandalone && <QuizCompletionSubscriber lesson={lesson} course={course} />}
				</div>
			</div>
		</QuizProvider>
	);
}

/** Component that listens to the `completionState` and marks lesson as completed, when quiz is `completed`. */
function QuizCompletionSubscriber({
	lesson,
	course
}: {
	lesson: QuestionProps["lesson"];
	course: NonNullable<QuestionProps["course"]>;
}) {
	const { completionState } = useQuiz();
	const unsubscribeRef = useRef(false);
	const markAsCompleted = useMarkAsCompleted(lesson.lessonId, course.slug ?? null);

	useEffect(() => {
		// TODO check if this useEffect is necessary
		if (!unsubscribeRef.current && completionState === "completed") {
			unsubscribeRef.current = true;
			console.log("QuizCompletionSubscriber: Marking as completed");
			markAsCompleted();
		}
	}, [completionState, markAsCompleted]);

	return <></>;
}

// exported for testing
export function QuizHeader({
	lesson,
	course,
	questions,
	currentIndex,
	questionOrder,
	goToQuestion
}: {
	lesson: QuestionProps["lesson"];
	course: QuestionProps["course"];
	currentIndex: number;
	questions: QuizContent;
	questionOrder: string[];
	goToQuestion: (index: number) => void;
}) {
	const { evaluations, completionState } = useQuiz();
	const { newEvent } = useEventLog();
	const [suppressDialog, setSuppressDialog] = useState(false);
	const orderedQuestions = useMemo(() => {
		return questionOrder
			.map(Id => questions.find(q => q.questionId === Id))
			.filter((q): q is NonNullable<typeof q> => !!q);
	}, [questionOrder, questions]);
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
					type: question.type
				}
			});
		},
		[newEvent, course?.courseId]
	);

	useEffect(() => {
		// TODO diary: check if the useEffect is necessary
		logQuizStart(lesson, orderedQuestions[currentIndex]);
	}, [orderedQuestions, currentIndex, logQuizStart, lesson]);

	return (
		<div className="flex flex-col gap-4">
			<div className="relative flex flex-col gap-2">
				{!isStandalone && <ChapterName course={course} lesson={lesson} />}

				<Link href={lessonUrl}>
					<h1 className="text-4xl">{lesson.title}</h1>
				</Link>
			</div>
			<Tabs onChange={goToQuestion} selectedIndex={currentIndex}>
				{orderedQuestions.map((question, index) => (
					<div onClick={() => logQuizStart(lesson, question)} key={question.questionId}>
						<Tab>
							<QuestionTab
								index={index}
								evaluation={evaluations[question.questionId]}
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
				/>
			)}
			{showFailureDialog && !isStandalone && (
				<QuizFailedDialog
					course={course}
					lesson={lesson}
					onClose={() => {
						setSuppressDialog(true);
					}}
				/>
			)}
		</div>
	);
}

function NextLessonButton({
	courseSlug,
	nextLessonSlug
}: {
	courseSlug: string;
	nextLessonSlug: string;
}) {
	return (
		<Link href={`/courses/${courseSlug}/${nextLessonSlug}`} className="btn-primary">
			<span>Zur nächsten Lerneinheit</span>
			<PlayIcon className="h-5 shrink-0" />
		</Link>
	);
}

function QuizCompletionDialog({
	course,
	lesson,
	onClose
}: {
	course: NonNullable<QuestionProps["course"]>;
	lesson: QuestionProps["lesson"];
	onClose: OnDialogCloseFn<void>;
}) {
	const { nextLesson } = useLessonContext(lesson.lessonId, course.slug);
	return (
		<Dialog onClose={onClose} title="Geschafft!" style={{ maxWidth: "600px" }}>
			<div className="flex flex-col text-sm text-light">
				<p>
					Du hast die Lerneinheit{" "}
					<span className="font-semibold text-secondary">{lesson.title}</span> erfolgreich
					abgeschlossen.
				</p>

				{nextLesson ? (
					<div className="flex flex-col">
						<p>Die nächste Lerneinheit ist ...</p>
						<span className="mt-4 self-center rounded-lg bg-gray-100 px-12 py-4 text-xl font-semibold tracking-tighter text-secondary">
							{nextLesson.title}
						</span>
					</div>
				) : (
					<p>
						Der Kurs{" "}
						<span className="font-semibold text-secondary">{course.title}</span> enthält
						keine weiteren Lerneinheiten für dich.
					</p>
				)}
			</div>

			<DialogActions onClose={onClose}>
				{nextLesson && (
					<NextLessonButton courseSlug={course.slug} nextLessonSlug={nextLesson.slug} />
				)}
			</DialogActions>
		</Dialog>
	);
}

function QuizFailedDialog({
	course,
	lesson,
	onClose
}: {
	course: NonNullable<QuestionProps["course"]>;
	lesson: QuestionProps["lesson"];
	onClose: OnDialogCloseFn<void>;
}) {
	const { reload } = useQuiz();
	const { nextLesson } = useLessonContext(lesson.lessonId, course.slug);

	return (
		<Dialog onClose={onClose} title="Nicht Bestanden" style={{ maxWidth: "600px" }}>
			<div className="flex flex-col text-sm text-light">
				<p>
					Du hast leider zu viele Fragen falsch beantwortet, um die Lerneinheit{" "}
					<span className="font-semibold text-secondary">{lesson.title}</span>{" "}
					abzuschließen.
				</p>
			</div>

			<DialogActions onClose={onClose}>
				<button className="btn-primary" onClick={reload}>
					<span>Erneut probieren</span>
					<ArrowPathIcon className="h-5 shrink-0" />
				</button>

				{nextLesson && (
					<NextLessonButton courseSlug={course.slug} nextLessonSlug={nextLesson.slug} />
				)}
			</DialogActions>
		</Dialog>
	);
}
