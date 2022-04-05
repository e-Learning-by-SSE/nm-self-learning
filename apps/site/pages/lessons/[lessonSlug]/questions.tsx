import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid";
import { getNanomoduleQuestionsBySlug } from "@self-learning/cms-api";
import { SidebarLayout } from "@self-learning/ui/layouts";
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
		console.log(nextIndex);
	}, [index, nextIndex, questions]);

	return (
		<SidebarLayout isSidebarOpen={true}>
			<div className="flex flex-col">
				<Link href={`/lessons/${slug}`}>
					<a className="flex items-center text-sm text-slate-400">
						<ChevronLeftIcon className="h-4" />
						<span>Zurück zum Inhalt</span>
					</a>
				</Link>
				<h1 className="mb-12 mt-2 text-2xl">Lernkontrolle</h1>

				<div className="flex flex-col gap-8">
					<h2 className="text-4xl">{currentQuestion.question}</h2>

					<ul className="flex flex-col gap-4">
						{currentQuestion.answers.map(answer => (
							<label
								htmlFor={answer.text}
								key={answer.text}
								className="flex items-center gap-2 rounded bg-slate-100 p-4"
							>
								<input type="checkbox" className="" id={answer.text} />
								{answer.text}
							</label>
						))}
					</ul>

					<div className="flex place-content-end gap-4">
						{nextIndex > 1 && (
							<button
								className="flex w-fit items-center gap-2 self-start rounded bg-slate-800 px-8 py-2 font-semibold text-white"
								onClick={() =>
									router.push(`/lessons/${slug}/questions?index=${nextIndex - 2}`)
								}
							>
								<ChevronLeftIcon className="h-5" />
								<span>Vorherige Frage</span>
							</button>
						)}
						{nextIndex < questions.length && (
							<button
								className="flex w-fit items-center gap-2 self-end rounded bg-emerald-500 px-8 py-2 font-semibold text-white"
								onClick={() =>
									router.push(`/lessons/${slug}/questions?index=${nextIndex}`)
								}
							>
								<span>Nächste Frage</span>
								<ChevronRightIcon className="h-5" />
							</button>
						)}
					</div>
				</div>
			</div>
		</SidebarLayout>
	);
}
