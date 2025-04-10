import { LessonType } from "@prisma/client";
import {
	getStaticPropsForStandaloneLessonLayout,
	StandaloneLessonLayout,
	StandaloneLessonLayoutProps
} from "@self-learning/lesson";
import { MdLookup, MdLookupArray } from "@self-learning/markdown";
import { QuizContent } from "@self-learning/question-types";
import {
	compileQuizMarkdown,
	defaultQuizConfig,
	Question,
	QuestionTab,
	Quiz,
	QuizProvider,
	useQuiz
} from "@self-learning/quiz";
import { Tab, Tabs } from "@self-learning/ui/common";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

type StandaloneLessonQuestionProps = StandaloneLessonLayoutProps & {
	quiz: Quiz;
	markdown: {
		questionsMd: MdLookup;
		answersMd: MdLookup;
		hintsMd: MdLookupArray;
	};
};

export const getServerSideProps: GetServerSideProps<StandaloneLessonQuestionProps> = async ({
	params,
	locale
}) => {
	const parentProps = await getStaticPropsForStandaloneLessonLayout(params);

	if ("notFound" in parentProps) return { notFound: true };

	const quiz = parentProps.lesson.quiz as Quiz | null;
	if (!quiz) return { notFound: true };

	const { questionsMd, answersMd, hintsMd, processedQuestions } = await compileQuizMarkdown(quiz);
	quiz.questions = processedQuestions;

	return {
		props: {
			...(await serverSideTranslations(locale ?? "en", ["common"])),
			...parentProps,
			quiz,
			markdown: { questionsMd, answersMd, hintsMd }
		}
	};
};

export default function StandaloneLessonQuizPage({
	lesson,
	quiz,
	markdown
}: StandaloneLessonQuestionProps) {
	const { questions, config } = quiz;
	const [currentQuestion, setCurrentQuestion] = useState(questions[0]);
	const router = useRouter();
	const { index } = router.query;
	const [nextIndex, setNextIndex] = useState(1);

	const goToNextQuestion = useCallback(() => {
		router.push(`/lessons/${lesson.slug}/quiz?index=${nextIndex}`, undefined, {
			shallow: true
		});
	}, [nextIndex, lesson.slug, router]);

	function goToQuestion(index: number) {
		router.push(`/lessons/${lesson.slug}/quiz?index=${index}`, undefined, {
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
			config={config ?? defaultQuizConfig}
			goToNextQuestion={goToNextQuestion}
			reload={router.reload}
		>
			<div className="flex w-full flex-col gap-4">
				<div className="flex w-full flex-col gap-4">
					<StandaloneLessonQuizHeader
						lesson={lesson}
						currentIndex={nextIndex - 1}
						goToQuestion={goToQuestion}
						questions={questions}
					/>

					<Question
						key={currentQuestion.questionId}
						question={currentQuestion}
						markdown={markdown}
						lesson={lesson}
					/>
				</div>
			</div>
		</QuizProvider>
	);
}

StandaloneLessonQuizPage.getLayout = StandaloneLessonLayout;

function StandaloneLessonQuizHeader({
	lesson,
	questions,
	currentIndex,
	goToQuestion
}: {
	lesson: StandaloneLessonQuestionProps["lesson"];
	currentIndex: number;
	questions: QuizContent;
	goToQuestion: (index: number) => void;
}) {
	const { evaluations, completionState } = useQuiz();
	const [suppressDialog, setSuppressDialog] = useState(false);

	if (completionState === "in-progress" && suppressDialog) {
		setSuppressDialog(false);
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="relative flex flex-col gap-2">
				<Link href={`/lessons/${lesson.slug}`}>
					<h1 className="text-4xl">{lesson.title}</h1>
				</Link>
			</div>

			<Tabs onChange={goToQuestion} selectedIndex={currentIndex}>
				{questions.map((question, index) => (
					<div key={question.questionId}>
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
		</div>
	);
}
