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
import { useCookies } from "react-cookie";
import { useEventLog } from "@self-learning/util/common";
import {
	CheckCircleIcon as CheckCircleIconOutline,
	XCircleIcon
} from "@heroicons/react/24/outline";

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
	const { goToNextQuestion, answers, setAnswers, evaluations, setEvaluations, config } =
		useQuiz();
	const { newEvent: writeEvent } = useEventLog();
	const answer = answers[question.questionId];
	const evaluation = evaluations[question.questionId];

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
		setEvaluations(prev => ({
			...prev,
			[question.questionId]: e
		}));

		await writeEvent({
			type: "LESSON_QUIZ_SUBMISSION",
			resourceId: lesson.lessonId,
			courseId: courseId,
			payload: {
				questionId: question.questionId,
				totalQuestionPool: 1,
				questionPoolIndex: 1,
				type: question.type,
				hintsUsed: question.hints?.map(hint => hint.hintId) ?? "",
				attempts: 1,
				solved: e?.isCorrect ?? false
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
								nextQuestionStep={goToNextQuestion}
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
					<QuestionAnswerRenderer question={question} lesson={lesson} />
				</div>

				{/* {question.withCertainty && <Certainty />} */}

				{config.hints.enabled && <Hints />}
			</article>
		</AnswerContextProvider>
	);
}

function CheckResult({
	setEvaluation,
	nextQuestionStep
}: {
	setEvaluation: (ev: { isCorrect: boolean } | null) => void;
	nextQuestionStep: () => void;
}) {
	// We only use "multiple-choice" to get better types ... works for all question types
	const { question, answer, evaluation: currentEvaluation } = useQuestion("multiple-choice");
	const { completionState, reload } = useQuiz();

	async function checkResult() {
		console.debug("checking...");
		const evaluation = EVALUATION_FUNCTIONS[question.type](question, answer);
		setEvaluation(evaluation);
	}
	if (!currentEvaluation) {
		<span className="text-red-500">No question state found for this question.</span>;
	}

	const canGoToNextQuestion = currentEvaluation;

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

export function QuestionTab(props: { evaluation: { isCorrect: boolean } | null; index: number }) {
	const isCorrect = props.evaluation?.isCorrect === true;
	const isIncorrect = props.evaluation?.isCorrect === false;

	return (
		<span className="flex items-center gap-4">
			{isCorrect ? (
				<QuestionTabIcon>
					<CheckCircleIcon className="h-5 text-secondary" />
				</QuestionTabIcon>
			) : isIncorrect ? (
				<QuestionTabIcon>
					<XCircleIcon className="h-5 text-red-500" />
				</QuestionTabIcon>
			) : (
				<QuestionTabIcon>
					<CheckCircleIconOutline className="h-5 text-gray-400" />
				</QuestionTabIcon>
			)}
			<span data-testid="questionTab">Aufgabe {props.index + 1}</span>
		</span>
	);
}

function QuestionTabIcon({ children }: { children: React.ReactNode }) {
	return <div>{children}</div>;
}
