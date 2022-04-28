import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid";
import { getNanomoduleQuestionsBySlug } from "@self-learning/cms-api";
import { CenteredContainer, SidebarLayout } from "@self-learning/ui/layouts";
import { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type NanomoduleWithQuestions = Exclude<
	Awaited<ReturnType<typeof getNanomoduleQuestionsBySlug>>,
	undefined | null
>;

type QuestionsProps = {
	nanomodule: NanomoduleWithQuestions;
};

type Question = {
	type: "multiple-choice";
	question: string;
	answers: {
		text: string;
		isCorrect: boolean;
	}[];
};

export const getStaticProps: GetStaticProps<QuestionsProps> = async ({ params }) => {
	const slug = params?.lessonSlug as string | undefined;

	if (!slug) {
		throw new Error("No slug provided.");
	}

	// const nanomoduleWithQuestions = (await getNanomoduleQuestionsBySlug(
	// 	slug
	// )) as NanomoduleWithQuestions;

	const nanomoduleWithQuestions: NanomoduleWithQuestions = {
		slug: "a-beginners-guide-to-react-introduction",
		title: "A Beginners Guide to React Introduction",
		questions: [
			{
				type: "multiple-choice",
				question: "What is your favorite framework ?",
				answers: [
					{
						text: "Angular"
					},
					{
						text: "React",
						isCorrect: true
					},
					{
						text: "Vue"
					},
					{
						text: "Svelte"
					}
				]
			},
			{
				type: "multiple-choice",
				question: "What is 1 + 1 ?",
				answers: [
					{
						text: "0"
					},
					{
						text: "1"
					},
					{
						text: "2",
						isCorrect: true
					},
					{
						text: "3"
					}
				]
			},
			{
				type: "multiple-choice",
				question: "What is your favorite color ?",
				answers: [
					{
						text: "Red"
					},
					{
						text: "Green"
					},
					{
						text: "Blue",
						isCorrect: true
					}
				]
			}
		]
	};

	return {
		props: {
			nanomodule: nanomoduleWithQuestions
		}
	};
};

export const getStaticPaths: GetStaticPaths = () => {
	return { paths: [], fallback: "blocking" };
};

export default function Questions({ nanomodule }: QuestionsProps) {
	const { slug, title, questions, image } = nanomodule;
	const [currentQuestion, setCurrentQuestion] = useState(questions[0] as Question);
	const router = useRouter();
	const { index } = router.query;
	const [nextIndex, setNextIndex] = useState(1);

	useEffect(() => {
		const indexNumber = Number(index);

		if (Number.isFinite(indexNumber) && indexNumber < questions.length) {
			setCurrentQuestion(questions[indexNumber]);
			setNextIndex(Number(index) + 1);
		} else {
			setCurrentQuestion(questions[0]);
			setNextIndex(1);
		}
	}, [index, nextIndex, questions]);

	return (
		<div className="mx-auto flex w-full flex-col py-16 px-2 md:max-w-3xl md:px-2">
			<Link href={`/lessons/${slug}`}>
				<a className="flex items-center text-sm text-slate-400">
					<ChevronLeftIcon className="h-4" />
					<span>Zurück zum Inhalt</span>
				</a>
			</Link>
			<h1 className="mb-12 mt-2 text-2xl">Lernkontrolle</h1>

			<div className="flex flex-col gap-8">
				<h2 className="text-4xl">{currentQuestion.question}</h2>

				<ul className="multi-gradient flex flex-col gap-4 rounded-lg p-8">
					{currentQuestion.answers.map(answer => (
						<label
							htmlFor={answer.text}
							key={answer.text}
							className="card glass flex items-center gap-2"
						>
							<input
								type="checkbox"
								className="wih checked:bg-indigo-500 focus:ring-1 focus:ring-indigo-500"
								id={answer.text}
							/>
							{answer.text}
						</label>
					))}
				</ul>

				<div className="flex place-content-end gap-4">
					{nextIndex > 1 && (
						<button
							className="flex items-center gap-2 rounded-lg border border-indigo-100 py-2 px-8 font-semibold"
							onClick={() =>
								router.push(
									`/lessons/${slug}/questions?index=${nextIndex - 2}`,
									undefined,
									{ shallow: true }
								)
							}
						>
							<ChevronLeftIcon className="h-5" />
							<span>Vorherige Frage</span>
						</button>
					)}
					{nextIndex < questions.length && (
						<button
							className="btn-primary"
							onClick={() =>
								router.push(
									`/lessons/${slug}/questions?index=${nextIndex}`,
									undefined,
									{ shallow: true }
								)
							}
						>
							<span>Nächste Frage</span>
							<ChevronRightIcon className="h-5" />
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
