import { CheckCircleIcon as CheckCircleIconOutline, XCircleIcon } from "@heroicons/react/outline";
import { CheckCircleIcon, CogIcon, PlayIcon, RefreshIcon } from "@heroicons/react/solid";
import { useMarkAsCompleted } from "@self-learning/completion";
import {
	getStaticPropsForLayout,
	LessonLayout,
	LessonLayoutProps,
	useLessonContext
} from "@self-learning/lesson";
import { compileMarkdown, MdLookup, MdLookupArray } from "@self-learning/markdown";
import { QuestionType, QuizContent } from "@self-learning/question-types";
import { Question, QuizProvider, useQuiz } from "@self-learning/quiz";
import { Dialog, DialogActions, OnDialogCloseFn, Tab, Tabs } from "@self-learning/ui/common";
import { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";

type QuestionProps = LessonLayoutProps & {
	questions: QuestionType[];
	markdown: {
		questionsMd: MdLookup;
		answersMd: MdLookup;
		hintsMd: MdLookupArray;
	};
};

export const getStaticProps: GetStaticProps<QuestionProps> = async ({ params }) => {
	const parentProps = await getStaticPropsForLayout(params);

	if ("notFound" in parentProps) return { notFound: true };

	const questions = (parentProps.lesson.quiz ?? []) as QuizContent;

	const questionsMd: MdLookup = {};
	const answersMd: MdLookup = {};
	const hintsMd: MdLookupArray = {};

	for (const question of questions) {
		questionsMd[question.questionId] = await compileMarkdown(question.statement);

		if (question.hints?.length > 0) {
			hintsMd[question.questionId] = [];

			for (const hint of question.hints) {
				hintsMd[question.questionId].push(await compileMarkdown(hint.content));
			}
		}

		if (question.type === "multiple-choice" || question.type === "vorwissen") {
			for (const answer of question.answers) {
				answersMd[answer.answerId] = await compileMarkdown(answer.content);
			}
		}
	}

	return {
		props: {
			...parentProps,
			questions: questions,
			markdown: {
				questionsMd,
				answersMd,
				hintsMd
			}
		}
	};
};

export const getStaticPaths: GetStaticPaths = () => {
	return { paths: [], fallback: "blocking" };
};

export default function QuestionsPage({ course, lesson, questions, markdown }: QuestionProps) {
	const [currentQuestion, setCurrentQuestion] = useState(questions[0]);
	const router = useRouter();
	const { index } = router.query;
	const [nextIndex, setNextIndex] = useState(1);
	// const hasPrevious = nextIndex > 1;
	// const hasNext = nextIndex < questions.length;

	const goToNextQuestion = useCallback(() => {
		router.push(`/courses/${course.slug}/${lesson.slug}/quiz?index=${nextIndex}`, undefined, {
			shallow: true
		});
	}, [nextIndex, course.slug, lesson.slug, router]);

	// function goToPreviousQuestion() {
	// 	router.push(
	// 		`/courses/${course.slug}/${lesson.slug}/quiz?index=${nextIndex - 2}`,
	// 		undefined,
	// 		{
	// 			shallow: true
	// 		}
	// 	);
	// }

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

	return (
		<QuizProvider
			questions={questions}
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
					/>
					<Question
						key={currentQuestion.questionId}
						question={currentQuestion}
						markdown={markdown}
					/>
					<QuizCompletionSubscriber lesson={lesson} course={course} />
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
	course: QuestionProps["course"];
}) {
	const { completionState } = useQuiz();
	const unsubscribeRef = useRef(false);
	const markAsCompleted = useMarkAsCompleted(lesson.lessonId, course.slug);

	useEffect(() => {
		if (!unsubscribeRef.current && completionState === "completed") {
			unsubscribeRef.current = true;
			console.log("QuizCompletionSubscriber: Marking as completed");
			markAsCompleted();
		}
	}, [completionState, markAsCompleted]);

	return <></>;
}

QuestionsPage.getLayout = LessonLayout;

function QuizHeader({
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
	const { evaluations, completionState } = useQuiz();
	const successDialogOpenedRef = useRef(false);
	const failureDialogOpenedRef = useRef(false);
	const [showSuccessDialog, setShowSuccessDialog] = useState(false);
	const [showFailureDialog, setShowFailureDialog] = useState(false);

	if (!successDialogOpenedRef.current && completionState === "completed") {
		successDialogOpenedRef.current = true;
		setShowSuccessDialog(true);
	}

	if (!failureDialogOpenedRef.current && completionState === "failed") {
		failureDialogOpenedRef.current = true;
		setShowFailureDialog(true);
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="relative flex flex-col gap-2">
				<span className="font-semibold text-secondary">{chapterName}</span>
				<Link legacyBehavior href={`/courses/${course.slug}/${lesson.slug}`}>
					<a>
						<h1 className="text-4xl">{lesson.title}</h1>
					</a>
				</Link>
				<Link legacyBehavior href={`/teaching/lessons/edit/${lesson.lessonId}`}>
					<a className="absolute right-0 top-1">
						<CogIcon className="h-5 text-gray-400" />
					</a>
				</Link>
			</div>

			<Tabs onChange={goToQuestion} selectedIndex={currentIndex}>
				{questions.map((question, index) => (
					<Tab key={question.questionId}>
						<QuestionTab index={index} evaluation={evaluations[question.questionId]} />
					</Tab>
				))}
			</Tabs>

			{showSuccessDialog && (
				<QuizCompletionDialog
					course={course}
					lesson={lesson}
					nextLesson={nextLesson}
					onClose={() => {
						setShowSuccessDialog(false);
					}}
				/>
			)}

			{showFailureDialog && (
				<QuizFailedDialog
					lesson={lesson}
					onClose={() => {
						setShowFailureDialog(false);
					}}
				/>
			)}
		</div>
	);
}

function QuestionTab(props: { evaluation: { isCorrect: boolean } | null; index: number }) {
	const isCorrect = props.evaluation?.isCorrect === true;
	const isIncorrect = props.evaluation?.isCorrect === false;

	return (
		<span className="flex items-center gap-4">
			{isCorrect ? (
				<CheckCircleIcon className="h-5 text-secondary" />
			) : isIncorrect ? (
				<XCircleIcon className="h-5 text-red-500" />
			) : (
				<CheckCircleIconOutline className="h-5 text-gray-400" />
			)}
			<span data-testid="questionTab">Frage {props.index + 1}</span>
		</span>
	);
}

function QuizCompletionDialog({
	course,
	lesson,
	nextLesson,
	onClose
}: {
	course: QuestionProps["course"];
	lesson: QuestionProps["lesson"];
	nextLesson: { title: string; slug: string } | null;
	onClose: OnDialogCloseFn<void>;
}) {
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
					<Link legacyBehavior href={`/courses/${course.slug}/${nextLesson.slug}`}>
						<a className="btn-primary">
							<span>Zur nächsten Lerneinheit</span>
							<PlayIcon className="h-5 shrink-0" />
						</a>
					</Link>
				)}
			</DialogActions>
		</Dialog>
	);
}

function QuizFailedDialog({
	lesson,
	onClose
}: {
	lesson: QuestionProps["lesson"];
	onClose: OnDialogCloseFn<void>;
}) {
	const { reload } = useQuiz();

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
					<RefreshIcon className="h-5 shrink-0" />
				</button>
			</DialogActions>
		</Dialog>
	);
}
