import { LightBulbIcon } from "@heroicons/react/outline";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid";
import { CenteredContainer, TopicHeader } from "@self-learning/ui/layouts";
import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

type NanomoduleWithQuestions = typeof nanomoduleWithQuestions;

type QuestionsPageProps = {
	nanomodule: NanomoduleWithQuestions;
};

const nanomoduleWithQuestions = {
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

export const getStaticProps: GetStaticProps<QuestionsPageProps> = async ({ params }) => {
	const slug = params?.lessonSlug as string | undefined;

	if (!slug) {
		throw new Error("No slug provided.");
	}

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
	const { slug, title, questions } = nanomodule;
	const [currentQuestion, setCurrentQuestion] = useState(questions[0]);
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
		<div className="bg-gray-50">
			<CenteredContainer>
				<TopicHeader
					// imgUrlBanner={image?.data?.attributes?.url}
					title="Lernkontrolle"
					subtitle={""}
					parentTitle={title}
					parentLink={`/lessons/${nanomodule.slug}`}
				>
					<QuestionNavigation
						amount={questions.length}
						current={nextIndex}
						hasPrevious={nextIndex > 1}
						hasNext={nextIndex < questions.length}
						goToNext={goToNextQuestion}
						goToPrevious={goToPreviousQuestion}
					/>
				</TopicHeader>
			</CenteredContainer>

			<div className="grid items-start gap-16 bg-gray-50 py-16 px-4 lg:px-0">
				<div className="mx-auto max-w-3xl">
					<Question title={currentQuestion.question} answers={currentQuestion.answers} />
				</div>
			</div>
		</div>
	);
}

function QuestionNavigation({
	current,
	amount,
	hasPrevious,
	hasNext,
	goToNext,
	goToPrevious
}: {
	current: number;
	amount: number;
	hasPrevious: boolean;
	hasNext: boolean;
	goToNext: () => void;
	goToPrevious: () => void;
}) {
	return (
		<div className="flex flex-wrap items-center justify-between gap-6 pt-4">
			<span>
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

			{/* <Cloze /> */}

			<Certainty />

			<div className="grid items-start gap-4">
				<button className="flex place-content-center gap-4 rounded-lg border border-slate-200 px-3 py-2">
					<LightBulbIcon className="h-6" /> Ich benötige einen Hinweis.
				</button>
				<span className="text-sm text-slate-400">
					Achtung: Das Verwenden von Hinweisen verringert die Anzahl der vergebenen
					Skill-Punkte.
				</span>
			</div>
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
			className={`flex w-full rounded-lg border p-4 transition-colors ${
				selected
					? "border-indigo-200 bg-indigo-500 text-white"
					: "border-slate-200 bg-white"
			}`}
			onClick={toggleSelected}
		>
			<span className="">{answer.text}</span>
		</button>
	);
}

function Certainty() {
	const { certainty, certaintyPhrase, setCertainty } = useCertainty(100);
	return (
		<div className="grid items-start gap-4">
			<span className="text-xl tracking-tighter">Wie sicher bist du dir ?</span>

			<div className="mt-2 flex flex-col">
				<input
					type="range"
					min={0}
					max={100}
					step={25}
					value={certainty}
					onChange={e => setCertainty(e.target.valueAsNumber)}
					className="bg-indigo-20 w-full"
				/>
				<span className="mt-1 text-right text-slate-400">
					Ich bin mir{" "}
					<span className="font-semibold text-slate-700">{certaintyPhrase}</span>.
				</span>
			</div>
		</div>
	);
}

function useCertainty(initialCertainty: number) {
	const [certainty, setCertainty] = useState(initialCertainty);

	const certaintyPhrase = useMemo(() => {
		return mapCertainty(certainty);
	}, [certainty]);

	return { certainty, setCertainty, certaintyPhrase };
}

function mapCertainty(certainty: number): string {
	if (certainty < 25) {
		return "überhaupt nicht sicher";
	}
	if (certainty < 50) {
		return "leicht unsicher";
	}
	if (certainty < 75) {
		return "leicht sicher";
	}
	if (certainty < 100) {
		return "sehr sicher";
	}
	if (certainty >= 100) {
		return "absolut sicher";
	}

	return "";
}

const text = `Lorem ipsum dolor sit amet consectetur adipisicing elit. Pariatur nostrum dolorem ### at placeat. Ad corrupti fugit, magnam ipsam iste similique voluptates. Doloribus repellat velit expedita molestias eaque consectetur nesciunt.
Temporibus, repellendus aspernatur provident unde ipsa voluptates delectus a adipisci itaque quam impedit suscipit harum illo voluptas saepe facere est distinctio non cum nesciunt. Dicta rerum dignissimos commodi cum molestias?
Quia nisi delectus quos, possimus eos id. Tempore iure sint harum nihil ### facilis expedita eveniet reprehenderit ipsa! Inventore ab similique, voluptatibus consectetur deleniti perspiciatis enim hic nesciunt, omnis sint blanditiis.
Expedita quo voluptatum, obcaecati accusamus in saepe esse maxime, neque soluta ### itaque! Aliquam est at dignissimos nobis illo delectus recusandae amet! ### beatae ea consequatur nobis natus repellendus vel!
Harum, adipisci vel corrupti, corporis error pariatur ad quasi quisquam, ### rem reiciendis! Repellendus velit minima veritatis vitae porro iure earum quas libero, error, qui exercitationem nihil et, cum veniam?`;

const transformedText = text.split("###");

function Cloze() {
	return (
		<div className="grid items-start gap-8">
			<span className="text-slate-400">Vervollständige den nachfolgenden Text:</span>

			<div className="leading-loose">
				{transformedText.map((text, index) => (
					<span key={text}>
						{text}
						{index < transformedText.length - 1 && (
							<input
								type="text"
								className="h-fit border border-gray-100 border-b-slate-500 bg-gray-100 py-1 focus:border-gray-100 focus:border-b-indigo-500"
								placeholder="BatChest"
							/>
						)}
					</span>
				))}
			</div>
		</div>
	);
}
