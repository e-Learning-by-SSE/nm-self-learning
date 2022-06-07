import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid";
import { getLessonBySlug } from "@self-learning/cms-api";
import { compileMarkdown } from "@self-learning/markdown";
import { Question, Answer, useQuizAttempt } from "@self-learning/quiz";
import { GetStaticPaths, GetStaticProps } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

function getQuiz(slug: string): QuestionType[] {
	return [
		{
			type: "multiple-choice",
			questionId: "923d78a5-af38-4599-980a-2b4cb62e4014",
			statement: `
			# How way your day?

			Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quasi molestias doloribus assumenda aspernatur in maxime numquam. Sint quas nobis voluptatum nemo consequatur aperiam ea sit eveniet, perferendis iure! Fugiat, optio!
			`.trim(),
			answers: [
				{
					answerId: "35d310ee-1acf-48e0-8f8c-090acd0e873a",
					content: "Good",
					isCorrect: true
				},
				{
					answerId: "cd33a2ef-95e8-4353-ad1d-de778d62ad57",
					content: "Bad",
					isCorrect: true
				}
			],
			hint: {
				content: "Just get smarter."
			}
		},
		{
			type: "short-text",
			questionId: "edbcf6a7-f9e9-4efe-b7ed-2bd0096c4e1d",
			statement: "# Was ist 1 + 1 ?",
			answers: null
		},
		{
			type: "text",
			questionId: "34fca2c2-c547-4f66-9a4e-927770a55090",
			statement: "# Was ist 1 + 1 ?",
			answers: null
		}
	];
}

type QuestionProps = {
	lesson: ResolvedValue<typeof getLessonBySlug>;
	questions: QuestionType[];
	markdown: {
		questionsMd: MdLookup;
		answersMd: MdLookup;
		hintsMd: MdLookup;
	};
};

type MdLookup = { [id: string]: ResolvedValue<typeof compileMarkdown> };

export const getStaticProps: GetStaticProps<QuestionProps> = async ({ params }) => {
	const slug = params?.lessonSlug as string | undefined;

	if (!slug) {
		throw new Error("No [lessonSlug] provided.");
	}

	const lesson = await getLessonBySlug(slug);

	const questions = getQuiz(slug ?? "");

	const questionsMd: MdLookup = {};
	const answersMd: MdLookup = {};
	const hintsMd: MdLookup = {};

	for (const question of questions) {
		questionsMd[question.questionId] = await compileMarkdown(question.statement);

		if (question.hint && !question.hint.disabled) {
			hintsMd[question.questionId] = await compileMarkdown(question.hint.content);
		}

		if (question.answers) {
			for (const answer of question.answers) {
				answersMd[answer.answerId] = await compileMarkdown(answer.content);
			}
		}
	}

	if (!slug) {
		throw new Error("No slug provided.");
	}

	return {
		notFound: !lesson,
		props: {
			lesson: lesson as Defined<typeof lesson>,
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

export default function QuestionsPage({ lesson, questions, markdown }: QuestionProps) {
	const { slug, title } = lesson;
	const [currentQuestion, setCurrentQuestion] = useState(questions[0]);
	const router = useRouter();
	const { index } = router.query;
	const [nextIndex, setNextIndex] = useState(1);

	// const { quizAttemptsInfo } = useQuizAttemptsInfo(
	// 	lesson.lessonId,
	// 	session?.user?.name as string
	// );

	function goToNextQuestion() {
		router.push(`/lessons/${slug}/quiz?index=${nextIndex}`, undefined, {
			shallow: true
		});
	}

	function goToPreviousQuestion() {
		router.push(`/lessons/${slug}/quiz?index=${nextIndex - 2}`, undefined, {
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
			<div className="grid items-start gap-16 bg-gray-50 px-4 pb-16 lg:px-0">
				<div className="mx-auto grid w-full max-w-3xl items-start gap-8">
					<QuestionNavigation
						lesson={lesson}
						amount={questions.length}
						current={nextIndex}
						hasPrevious={nextIndex > 1}
						hasNext={nextIndex < questions.length}
						goToNext={goToNextQuestion}
						goToPrevious={goToPreviousQuestion}
					/>
					<Question question={currentQuestion} markdown={markdown} />
				</div>
			</div>
		</div>
	);
}

function QuestionNavigation({
	lesson,
	current,
	amount,
	hasPrevious,
	hasNext,
	goToNext,
	goToPrevious
}: {
	lesson: QuestionProps["lesson"];
	current: number;
	amount: number;
	hasPrevious: boolean;
	hasNext: boolean;
	goToNext: () => void;
	goToPrevious: () => void;
}) {
	const { submitAnswers } = useQuizAttempt();
	const { data: session } = useSession({ required: true });

	return (
		<div className="flex flex-col gap-4 rounded-b-lg border-x border-b border-light-border bg-white p-4">
			<div className="flex flex-col gap-2">
				<h2 className="text-lg text-secondary">{lesson.title}</h2>
				<h1 className="text-4xl">Lernkontrolle</h1>
			</div>
			<div className="flex flex-wrap items-center justify-between gap-6">
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
				{/* <button
				className="btn-primary mt-8"
				onClick={() =>
					submitAnswers({
						username: session?.user?.name as string,
						lessonId: lesson.lessonId,
						answers: [],
						state: "COMPLETED"
					})
				}
			>
				Submit Answers
			</button> */}
			</div>
		</div>
	);
}

// function Question({ title, answers }: { title: string; answers: { text: string }[] }) {
// 	return (
// 		<div className="flex flex-col gap-16">
// 			<h2 className="text-4xl">{title}</h2>

// 			<ul className="flex flex-col gap-8">
// 				{answers.map(answer => (
// 					<Answer key={answer.text} answer={answer} />
// 				))}
// 			</ul>

// 			{/* <Cloze /> */}

// 			<Certainty />

// 			<div className="grid items-start gap-4">
// 				<button className="flex place-content-center gap-4 rounded-lg border border-slate-200 px-3 py-2">
// 					<LightBulbIcon className="h-6" /> Ich benötige einen Hinweis.
// 				</button>
// 				<span className="text-sm text-slate-400">
// 					Achtung: Das Verwenden von Hinweisen verringert die Anzahl der vergebenen
// 					Skill-Punkte.
// 				</span>
// 			</div>
// 		</div>
// 	);
// }

// function Answer({ answer }: { answer: { text: string } }) {
// 	const [selected, setSelected] = useState(false);

// 	function toggleSelected() {
// 		setSelected(value => !value);
// 	}

// 	return (
// 		<button
// 			className={`flex w-full rounded-lg border p-4 transition-colors ${
// 				selected
// 					? "border-indigo-200 bg-indigo-500 text-white"
// 					: "border-slate-200 bg-white"
// 			}`}
// 			onClick={toggleSelected}
// 		>
// 			<span className="">{answer.text}</span>
// 		</button>
// 	);
// }

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
