import { LightBulbIcon } from "@heroicons/react/outline";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid";
import { getLessonBySlug } from "@self-learning/cms-api";
import { compileMarkdown } from "@self-learning/markdown";
import { useQuizAttempt, useQuizAttemptsInfo } from "@self-learning/quiz";
import { TopicHeader } from "@self-learning/ui/layouts";
import { GetStaticPaths, GetStaticProps } from "next";
import { useSession } from "next-auth/react";
import { MDXRemote } from "next-mdx-remote";
import { useRouter } from "next/router";
import { ReactElement, useEffect, useMemo, useState } from "react";

type Question = {
	type: "multiple-choice";
	questionId: string;
	content: string;
	answers: {
		answerId: string;
		content: string;
		isCorrect: boolean;
	}[];
	hint?: {
		disabled?: boolean;
		content: string;
	};
};

function getQuiz(slug: string): Question[] {
	return [
		{
			type: "multiple-choice",
			questionId: "923d78a5-af38-4599-980a-2b4cb62e4014",
			content: `
			# How way your day?

			Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quasi molestias doloribus assumenda aspernatur in maxime numquam. Sint quas nobis voluptatum nemo consequatur aperiam ea sit eveniet, perferendis iure! Fugiat, optio!
			`.trim(),
			answers: [
				{
					answerId: "35d310ee-1acf-48e0-8f8c-090acd0e873a",
					content: `
					# Answer #1

					## Good

					[Look at this](#)

					![Image](http://localhost:4200/_next/image?url=http%3A%2F%2Flocalhost%3A1337%2Fuploads%2Fa_beginners_guide_to_react_39990bb89a.webp&w=1920&q=75)
					
					Select this answer, if your day was good.
					`.trim(),
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
		}
	];
}

type QuestionProps = {
	lesson: ResolvedValue<typeof getLessonBySlug>;
	questions: Question[];
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
		questionsMd[question.questionId] = await compileMarkdown(question.content);

		if (question.hint && !question.hint.disabled) {
			hintsMd[question.questionId] = await compileMarkdown(question.hint.content);
		}

		for (const answer of question.answers) {
			answersMd[answer.answerId] = await compileMarkdown(answer.content);
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
	const { submitAnswers } = useQuizAttempt();
	const { data: session } = useSession({ required: true });
	// const { quizAttemptsInfo } = useQuizAttemptsInfo(
	// 	lesson.lessonId,
	// 	session?.user?.name as string
	// );

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
			<div className="mx-auto max-w-screen-lg">
				<TopicHeader
					title="Lernkontrolle"
					subtitle={""}
					parentTitle={title}
					parentLink={`/lessons/${lesson.slug}`}
				>
					<QuestionNavigation
						amount={questions.length}
						current={nextIndex}
						hasPrevious={nextIndex > 1}
						hasNext={nextIndex < questions.length}
						goToNext={goToNextQuestion}
						goToPrevious={goToPreviousQuestion}
					/>

					<button
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
					</button>
				</TopicHeader>
			</div>

			<div className="grid items-start gap-16 bg-gray-50 py-16 px-4 lg:px-0">
				<div className="mx-auto max-w-3xl">
					<QuestionX question={currentQuestion} markdown={markdown} />
					{/* <Question title={currentQuestion.content} answers={currentQuestion.answers} /> */}
				</div>
			</div>
		</div>
	);
}

function QuestionX({
	question,
	markdown
}: {
	question: QuestionProps["questions"][0];
	markdown: QuestionProps["markdown"];
}) {
	return (
		<div className="prose prose-indigo max-w-full">
			{markdown.questionsMd[question.questionId] ? (
				<MDXRemote {...markdown.questionsMd[question.questionId]} />
			) : (
				<span className="text-red-500">Error: No markdown content found.</span>
			)}

			<div className="mt-12 flex flex-col gap-8">
				{question.answers.map(answer => (
					<AnswerX
						key={answer.answerId}
						content={
							markdown.answersMd[answer.answerId] ? (
								<MDXRemote {...markdown.answersMd[answer.answerId]} />
							) : (
								<span className="text-red-500">
									Error: No markdown content found.
								</span>
							)
						}
					/>
				))}
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

function AnswerX({ content }: { content: ReactElement }) {
	const [selected, setSelected] = useState(false);

	function toggleSelected() {
		setSelected(value => !value);
	}

	return (
		<button
			className={`flex w-full flex-col rounded-lg border p-4 transition-colors ${
				selected
					? "border-indigo-200 bg-indigo-500 text-white prose-headings:text-white prose-a:text-white"
					: "border-slate-200 bg-white"
			}`}
			onClick={toggleSelected}
		>
			{content}
		</button>
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
