import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid";
import { getNanomoduleQuestionsBySlug } from "@self-learning/cms-api";
import { CenteredContainer, TopicHeader } from "@self-learning/ui/layouts";
import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type NanomoduleWithQuestions = Exclude<
	Awaited<ReturnType<typeof getNanomoduleQuestionsBySlug>>,
	undefined | null
>;

type QuestionsPageProps = {
	nanomodule: NanomoduleWithQuestions;
};

type QuestionType = {
	type: "multiple-choice";
	question: string;
	answers: {
		text: string;
		isCorrect: boolean;
	}[];
};

export const getStaticProps: GetStaticProps<QuestionsPageProps> = async ({ params }) => {
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

export default function QuestionsPage({ nanomodule }: QuestionsPageProps) {
	const { slug, title, questions, image } = nanomodule;
	const [currentQuestion, setCurrentQuestion] = useState(questions[0] as QuestionType);
	const router = useRouter();
	const { index } = router.query;
	const [nextIndex, setNextIndex] = useState(1);

	function goToNextQuestion() {
		router.push(`/lessons/${slug}/questions?index=${nextIndex}`, undefined, {
			shallow: true
		});
	}

	function goToPreviousQuestion() {
		router.push(`/lessons/${slug}/questions?index=${nextIndex - 2}`, undefined, {
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
		<div className="gradient min-h-screen">
			<CenteredContainer className="pb-16">
				<TopicHeader
					imgUrlBanner={image?.data?.attributes?.url}
					title="Lernkontrolle"
					subtitle={""}
					parentTitle={title}
					parentLink={`/lessons/${nanomodule.slug}`}
				>
					<div className="flex flex-wrap items-center justify-between gap-6 pt-4">
						<span>
							Frage {nextIndex} von {nanomodule.questions?.length}
						</span>
						<div className="flex flex-wrap place-content-end gap-4">
							<button
								disabled={nextIndex === 1}
								className="btn-stroked w-full sm:w-fit"
								onClick={goToPreviousQuestion}
							>
								<ChevronLeftIcon className="h-5" />
								<span>Vorherige Frage</span>
							</button>
							<button
								disabled={nextIndex >= questions.length}
								className="btn-primary w-full sm:w-fit"
								onClick={goToNextQuestion}
							>
								<span>Nächste Frage</span>
								<ChevronRightIcon className="h-5" />
							</button>
						</div>
					</div>
				</TopicHeader>
			</CenteredContainer>

			<div className="bg-gray-50 py-16">
				<div className="mx-auto max-w-3xl px-4 lg:px-0">
					<Question title={currentQuestion.question} answers={currentQuestion.answers} />
				</div>
			</div>
		</div>
	);
}

function Question({ title, answers }: { title: string; answers: { text: string }[] }) {
	return (
		<div className="flex flex-col gap-16">
			<h2 className="text-4xl">{title}</h2>

			<ul className="flex flex-col gap-8">
				{answers.map(answer => (
					<Answer key={answer.text} answer={answer} />
				))}
			</ul>
		</div>
	);
}

function Answer({ answer }: { answer: { text: string } }) {
	const [selected, setSelected] = useState(false);

	function toggleSelected() {
		setSelected(value => !value);
	}

	return (
		<button
			className={`card text-start flex w-full border shadow-lg ${
				selected ? "border-indigo-400 bg-indigo-500 text-white" : "border-white bg-white"
			}`}
			onClick={toggleSelected}
		>
			<span className="font">{answer.text}</span>
		</button>
	);
}
