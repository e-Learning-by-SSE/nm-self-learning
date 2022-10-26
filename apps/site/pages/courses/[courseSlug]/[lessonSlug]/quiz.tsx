import { CheckCircleIcon as CheckCircleIconOutline, XCircleIcon } from "@heroicons/react/outline";
import { CheckCircleIcon } from "@heroicons/react/solid";
import { ChevronLeftIcon, ChevronRightIcon, CogIcon } from "@heroicons/react/solid";
import {
	getStaticPropsForLayout,
	LessonLayout,
	LessonLayoutProps,
	useLessonContext
} from "@self-learning/lesson";
import { compileMarkdown, MdLookup, MdLookupArray } from "@self-learning/markdown";
import { QuestionType, QuizContent } from "@self-learning/question-types";
import { Question, QuizProvider, useQuiz } from "@self-learning/quiz";
import {
	Dialog,
	DialogActions,
	Tab,
	Tabs,
	VerticalTab,
	VerticalTabs
} from "@self-learning/ui/common";
import { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

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
		<QuizProvider questions={questions} goToNextQuestion={goToNextQuestion}>
			<div className="flex w-full flex-col gap-4 px-4 pt-8 pb-16 xl:w-[1212px] xl:px-8">
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
				</div>
			</div>
		</QuizProvider>
	);
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

	return (
		<div className="flex flex-col gap-4">
			<div className="relative flex flex-col gap-2">
				<span className="font-semibold text-secondary">{chapterName}</span>
				<Link href={`/courses/${course.slug}/${lesson.slug}`}>
					<a>
						<h1 className="text-4xl">{lesson.title}</h1>
					</a>
				</Link>
				<Link href={`/teaching/lessons/edit/${lesson.lessonId}`}>
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
			<span className="">Frage {props.index + 1}</span>
		</span>
	);
}

// function QuizCompletionDialog() {
// 	return (
// 		<Dialog onClose={} title="Lernkontrolle">
// 			<DialogActions onClose={}></DialogActions>
// 		</Dialog>
// 	);
// }
