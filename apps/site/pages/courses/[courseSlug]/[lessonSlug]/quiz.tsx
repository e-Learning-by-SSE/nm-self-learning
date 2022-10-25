import { ChevronLeftIcon, ChevronRightIcon, CogIcon } from "@heroicons/react/solid";
import {
	getStaticPropsForLayout,
	LessonLayout,
	LessonLayoutProps,
	useLessonContext
} from "@self-learning/lesson";
import { compileMarkdown, MdLookup, MdLookupArray } from "@self-learning/markdown";
import { QuestionType, QuizContent } from "@self-learning/question-types";
import { Question, QuizProvider } from "@self-learning/quiz";
import { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

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
	const hasPrevious = nextIndex > 1;
	const hasNext = nextIndex < questions.length;

	function goToNextQuestion() {
		router.push(`/courses/${course.slug}/${lesson.slug}/quiz?index=${nextIndex}`, undefined, {
			shallow: true
		});
	}

	function goToPreviousQuestion() {
		router.push(
			`/courses/${course.slug}/${lesson.slug}/quiz?index=${nextIndex - 2}`,
			undefined,
			{
				shallow: true
			}
		);
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
		<QuizProvider questions={questions}>
			<div className="flex w-full flex-col gap-4 px-4 pt-8 pb-16 xl:w-[1212px] xl:px-8">
				<div className="flex w-full flex-col gap-4">
					<QuestionNavigation
						lesson={lesson}
						course={course}
						amount={questions.length}
						current={nextIndex}
						hasPrevious={hasPrevious}
						hasNext={hasNext}
						goToNext={goToNextQuestion}
						goToPrevious={goToPreviousQuestion}
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

function QuestionNavigation({
	lesson,
	course,
	current,
	amount,
	hasPrevious,
	hasNext,
	goToNext,
	goToPrevious
}: {
	lesson: QuestionProps["lesson"];
	course: QuestionProps["course"];
	current: number;
	amount: number;
	hasPrevious: boolean;
	hasNext: boolean;
	goToNext: () => void;
	goToPrevious: () => void;
}) {
	const { chapterName } = useLessonContext(lesson.lessonId, course.slug);

	return (
		<div className="flex flex-col gap-4 border-b border-light-border pb-4">
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

			<div className="flex flex-wrap items-center justify-between gap-6">
				<span className="">
					Frage {current} von {amount}
				</span>
				<div className="flex flex-wrap place-content-end gap-4">
					<button
						disabled={!hasPrevious}
						className="btn-stroked w-full sm:w-fit"
						onClick={goToPrevious}
					>
						<ChevronLeftIcon className="h-5" />
						<span>Vorherige Frage</span>
					</button>
					<button
						disabled={!hasNext}
						className="btn-primary w-full sm:w-fit"
						onClick={goToNext}
					>
						<span>Nächste Frage</span>
						<ChevronRightIcon className="h-5" />
					</button>
				</div>
			</div>
		</div>
	);
}
