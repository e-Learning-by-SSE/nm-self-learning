import { ArrowPathIcon } from "@heroicons/react/24/solid";
import type { MdLookup, MdLookupArray } from "@self-learning/markdown";
import {
	AnswerContextProvider,
	EVALUATION_FUNCTIONS,
	QuestionAnswerRenderer,
	QuestionType,
	QUESTION_TYPE_DISPLAY_NAMES,
	useQuestion
} from "@self-learning/question-types";
import { MarkdownContainer } from "@self-learning/ui/layouts";
import { MDXRemote } from "next-mdx-remote";
import { Hints } from "./hints";
import { useQuiz } from "./quiz-context";
import { LessonLayoutProps } from "@self-learning/lesson";
import { LessonType } from "@prisma/client";
import { useState } from "react";
import {
	loadFromStorage,
	gatherLearningActivity,
	saveToStorage
} from "@self-learning/learning-analytics";
import { trpc } from "@self-learning/api-client";
import { QuizInfoType, StorageKeys, LearningSequence } from "@self-learning/types";

export function Question({
	question,
	markdown,
	lesson,
	isLastQuestion
}: {
	question: QuestionType;
	markdown: {
		questionsMd: MdLookup;
		answersMd: MdLookup;
		hintsMd: MdLookupArray;
	};
	lesson: LessonLayoutProps["lesson"];
	isLastQuestion: boolean;
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

	function setAnswer(v: any) {
		const value = typeof v === "function" ? v(answer) : v;

		setAnswers(prev => ({
			...prev,
			[question.questionId]: value
		}));
	}

	function setEvaluation(e: any) {
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
								setEvaluation={setEvaluation}
								nextQuestionStep={nextQuestionStep}
								isLastQuestionStep={currentStep === totalSteps}
								isLastQuestion={isLastQuestion}
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
	isLastQuestionStep,
	isLastQuestion
}: {
	setEvaluation: (ev: { isCorrect: boolean } | null) => void;
	nextQuestionStep: () => void;
	isLastQuestionStep: boolean;
	isLastQuestion: boolean;
}) {
	// We only use "multiple-choice" to get better types ... works for all question types
	const { question, answer, evaluation: currentEvaluation } = useQuestion("multiple-choice");
	const { completionState, reload } = useQuiz();
	//Learning Analytics: save quiz
	const { mutateAsync: createLearningAnalytics } = trpc.learningAnalytics.create.useMutation();
	const { mutateAsync: createLASession } = trpc.learningAnalytics.createSession.useMutation();

	async function saveQuizBeforeReload() {
		const lQuizInfo = loadFromStorage("la_quizInfo");
		if (lQuizInfo?.quizStart != null) {
			lQuizInfo.quizEnd = new Date();
			saveToStorage("la_quizInfo", lQuizInfo);
		}
		const data = gatherLearningActivity(); // ersetzen direkt mit 	storeSessionEndsToStorage();
		if (data) {
			try {
				if (data.sessionId < 0) {
					const laSession = loadFromStorage("la_lessonInfo");
					if (laSession) {
						const session = await createLASession({
							start: laSession.lessonStart.toISOString(),
							end: laSession?.lessonEnd?.toISOString()
						});
						laSession.id = session.id;
						saveToStorage("la_sessionInfo", laSession);
						data.sessionId = session.id;
						await createLearningAnalytics(data);
					}
				} else {
					await createLearningAnalytics(data);
				}
			} catch (e) {
				console.log("Error saving learning analytics from Quiz.", e);
			}
		}
		reload();
	}

	function checkResult() {
		console.log("checking...");
		const evaluation = EVALUATION_FUNCTIONS[question.type](question, answer);
		console.log("question", question);
		console.log("answer", answer);
		console.log("evaluation", evaluation);

		//Learning Analytics: get number of correct and incorrect answers
		const quizInfo = loadFromStorage("la_quizInfo");
		if (quizInfo?.numberCorrectAnswers != null && quizInfo?.numberIncorrectAnswers != null) {
			if (evaluation.isCorrect) {
				quizInfo.numberCorrectAnswers++;
			} else {
				quizInfo.numberIncorrectAnswers++;
			}
			saveToStorage("la_quizInfo", quizInfo);
		}

		setEvaluation(evaluation);
	}

	if (!currentEvaluation) {
		<span className="text-red-500">No question state found for this question.</span>;
	}

	const canGoToNextQuestion = currentEvaluation || !isLastQuestionStep;

	return (
		<>
			{completionState === "in-progress" ? (
				<button
					className="btn-primary"
					onClick={canGoToNextQuestion ? nextQuestionStep : checkResult}
				>
					{canGoToNextQuestion ? "Nächste Frage" : "Überprüfen"}
				</button>
			) : completionState === "failed" ? (
				<button className="btn bg-red-500" onClick={saveQuizBeforeReload}>
					<span>Erneut probieren</span>
					<ArrowPathIcon className="h-5" />
				</button>
			) : (
				// eslint-disable-next-line react/jsx-no-useless-fragment
				<></>
			)}
			{/* {eslint-disable-next-line react/jsx-no-useless-fragment} */}
		</>
	);
}
