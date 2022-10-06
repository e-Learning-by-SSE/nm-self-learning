import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid";
import { getStaticPropsForLayout, LessonLayout, LessonLayoutProps } from "@self-learning/lesson";
import { compileMarkdown, MdLookup, MdLookupArray } from "@self-learning/markdown";
import { QuestionType, QuizContent } from "@self-learning/question-types";
import { Question } from "@self-learning/quiz";
import { CenteredContainer } from "@self-learning/ui/layouts";
import { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const text = `Lorem ipsum dolor sit amet consectetur adipisicing elit. Pariatur nostrum dolorem ### at placeat. Ad corrupti fugit, magnam ipsam iste similique voluptates. Doloribus repellat velit expedita molestias eaque consectetur nesciunt.
Temporibus, repellendus aspernatur provident unde ipsa voluptates delectus a adipisci itaque quam impedit suscipit harum illo voluptas saepe facere est distinctio non cum nesciunt. Dicta rerum dignissimos commodi cum molestias?
Quia nisi delectus quos, possimus eos id. Tempore iure sint harum nihil ### facilis expedita eveniet reprehenderit ipsa! Inventore ab similique, voluptatibus consectetur deleniti perspiciatis enim hic nesciunt, omnis sint blanditiis.
Expedita quo voluptatum, obcaecati accusamus in saepe esse maxime, neque soluta ### itaque! Aliquam est at dignissimos nobis illo delectus recusandae amet! ### beatae ea consequatur nobis natus repellendus vel!
// eslint-disable-next-line indent
Harum, adipisci vel corrupti, corporis error pariatur ad quasi quisquam, ### rem reiciendis! Repellendus velit minima veritatis vitae porro iure earum quas libero, error, qui exercitationem nihil et, cum veniam?`;

const textArray = text.split("###");

function getQuiz(slug: string): QuizContent {
	return [
		{
			type: "multiple-choice",
			questionId: "923d78a5-af38-4599-980a-2b4cb62e4014",
			statement: `
			# How was your day?

			Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quasi molestias doloribus assumenda aspernatur in maxime numquam. Sint quas nobis voluptatum nemo consequatur aperiam ea sit eveniet, perferendis iure! Fugiat, optio!
			`.trim(),
			withCertainty: true,
			answers: [
				{
					answerId: "1fc74b31-7772-4ea8-b570-60b5c104f804",
					content: "Very Good",
					isCorrect: true
				},
				{
					answerId: "35d310ee-1acf-48e0-8f8c-090acd0e873a",
					content: "Good",
					isCorrect: true
				},
				{
					answerId: "cd33a2ef-95e8-4353-ad1d-de778d62ad57",
					content: "Bad",
					isCorrect: false
				},
				{
					answerId: "211b5171-d7b2-4fc9-98ab-88af35f53df2",
					content: "Very Bad",
					isCorrect: false
				}
			],
			hints: [
				{
					hintId: "abc",
					content:
						"Lorem ipsum dolor sit amet consectetur adipisicing elit. Libero laudantium sequi illo, veritatis labore culpa, eligendi, quod consequatur autem ad dolorem explicabo quos alias harum fuga sapiente reiciendis. Incidunt, voluptates."
				},
				{
					hintId: "def",
					content: "# Lorem ipsum dolor \n- Eins\n- Zwei"
				}
			]
		},
		{
			type: "short-text",
			questionId: "edbcf6a7-f9e9-4efe-b7ed-2bd0096c4e1d",
			statement: "# Was ist 1 + 1 ?",
			withCertainty: true,
			acceptedAnswers: [
				{
					acceptedAnswerId: "724f781e-56b2-4057-831e-b1d6962c48b1",
					value: "2"
				}
			],
			hints: []
		},
		{
			type: "text",
			questionId: "34fca2c2-c547-4f66-9a4e-927770a55090",
			statement: "# Was ist 1 + 1 ?",
			withCertainty: true,
			hints: []
		},
		{
			type: "cloze",
			questionId: "49497f71-8ed2-44a6-b36c-a44a4b0617d1",
			statement: "# Lückentext",
			withCertainty: false,
			textArray: textArray,
			hints: []
		},
		{
			type: "vorwissen",
			questionId: "c9de042a-6962-4f21-bc57-bf58841be5f2",
			statement: `lorem ipsum dolor sit amet consectetur adipisicing elit. **Quasi** molestias doloribus assumenda aspernatur in maxime numquam. Sint quas nobis voluptatum nemo consequatur aperiam ea sit eveniet, perferendis iure ?
			![image](https://images.unsplash.com/photo-1523875194681-bedd468c58bf?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1742&q=80)`,
			answers: [
				{
					answerId: "f797e6fc-8d03-41a2-9c93-9fcb3da0c147",
					content: "Statement 1",
					isCorrect: false
				},
				{
					answerId: "ef88d034-a0ea-4e85-bfc0-4381021f2449",
					content: "Statement 2",
					isCorrect: false
				},
				{
					answerId: "d0a1af94-92ea-4415-b1e3-cca7218b132a",
					content: "Statement 3",
					isCorrect: false
				},
				{
					answerId: "1220605d-e1b2-4933-bc7f-31b73c7a17bf",
					content: "Statement 4",
					isCorrect: false
				}
			],
			requireExplanationForAnswerIds: "ef88d034-a0ea-4e85-bfc0-4381021f2449",
			withCertainty: false,
			hints: []
		},
		{
			type: "programming",
			language: "java",
			withCertainty: false,
			questionId: "b6169fcf-3380-4062-9ad5-0af8826f2dfe",
			statement: `# Hello World
			
Erstelle ein Programm, welches \`Hello World\` auf der Konsole ausgibt.`,
			custom: {
				mode: "standalone",
				solutionTemplate: `public class HelloWorld {
	public static void main(String[] args) {
		System.out.println("Hello World");
	}
}`,
				expectedOutput: "Hello World"
			},
			hints: [
				{
					hintId: "asdrfewq",
					content: "```java\nSystem.out.println();```"
				}
			]
		},
		{
			type: "programming",
			language: "typescript",
			withCertainty: false,
			questionId: "dee8dfd5-ee07-4071-bf7b-33b4cb1fe623",
			statement: `# Schleifen
			
Implementiere einen Algorithmus, der als Eingabe eine Liste von Zahlen erhält und die Summe aller Zahlen in der Liste zurückgibt.

**Beispiel:**

**Eingabe**: \`[1, 2, 3, 4, 5]\`  
**Ausgabe**: \`15\`
`,
			custom: {
				mode: "callable",
				solutionTemplate:
					"export function sum(numbers: number[]): number {\n\t// DEINE LÖSUNG\n\treturn 0;\t\n}",
				mainFile: `import { sum } from "./Solution";

const testCases = [
	[1, 1],
	[1, 2, 3, 4, 5],
	[7],
	[],
];

function sumExpected(numbers: number[]): number {
	return numbers.reduce((a, b) => a + b, 0);
}

for (const testCase of testCases) {
	console.log(sum(testCase));
}

console.log("### EXPECTED ###")

for (const testCase of testCases) {
	console.log(sumExpected(testCase));
}
`
			},
			hints: [
				{
					hintId: "dskfjsdk",
					content:
						"```ts\n// Verwende eine for-Schleife, um über alle Zahlen der Liste zu iterieren.\nfor (let i = 0; i < numbers.length; i++) {\n\t// DEINE LÖSUNG HIER\n}\n```"
				}
			]
		},
		{
			type: "programming",
			language: "java",
			withCertainty: false,
			questionId: "b5884b38-bed2-4f00-8c21-8a7b0737af2e",
			statement: `# Schleifen
			
Implementiere einen Algorithmus, der als Eingabe eine Liste von Zahlen erhält und die Summe aller Zahlen in der Liste zurückgibt.

**Beispiel:**

**Eingabe**: \`[1, 2, 3, 4, 5]\`  
**Ausgabe**: \`15\`
`,
			custom: {
				mode: "callable",
				solutionTemplate: `public class Solution {
	public int sum(int[] numbers) {
		// DEINE LÖSUNG
		return 0;
	}
}`,
				mainFile: `import java.util.Arrays;

public class Main {
	public static void main(String[] args) {
		int[][] testCases = new int[][] {
			new int[] { 1, 1 },
			new int[] { 1, 2, 3, 4, 5 },
			new int[] { 7 },
			new int[] { }
		};

		for (int[] testCase : testCases) {
			System.out.println("### TEST");
			System.out.println(Arrays.toString(testCase));
			System.out.println("### EXPECTED");
			System.out.println(sumExpected(testCase));
			System.out.println("### ACTUAL");
			System.out.println(new Solution().sum(testCase));
		}
	}

	private static int sumExpected(int[] numbers) {
		int sum = 0;
		for (int number : numbers) {
			sum += number;
		}
		return sum;
	}
}
`
			},
			hints: [
				{
					hintId: "dskfjsdk",
					content:
						"```ts\n// Verwende eine for-Schleife, um über alle Zahlen der Liste zu iterieren.\nfor (let i = 0; i < numbers.length; i++) {\n\t// DEINE LÖSUNG HIER\n}\n```"
				}
			]
		}
	];
}

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

	const questions = getQuiz(parentProps.lesson?.slug ?? "");

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
	const { slug } = lesson;
	const [currentQuestion, setCurrentQuestion] = useState(questions[0]);
	const router = useRouter();
	const { index } = router.query;
	const [nextIndex, setNextIndex] = useState(1);

	// const { quizAttemptsInfo } = useQuizAttemptsInfo(
	// 	lesson.lessonId,
	// 	session?.user?.name as string
	// );

	function goToNextQuestion() {
		router.push(`/courses/${course.slug}/${slug}/quiz?index=${nextIndex}`, undefined, {
			shallow: true
		});
	}

	function goToPreviousQuestion() {
		router.push(`/courses/${course.slug}/${slug}/quiz?index=${nextIndex - 2}`, undefined, {
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
		<div className="grid grow items-start gap-16 bg-gray-50 px-2 pb-16">
			<div className="mx-auto flex w-full flex-col gap-8">
				<QuestionNavigation
					lesson={lesson}
					course={course}
					amount={questions.length}
					current={nextIndex}
					hasPrevious={nextIndex > 1}
					hasNext={nextIndex < questions.length}
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
	// const { submitAnswers } = useQuizAttempt();
	// const { data: session } = useSession({ required: true });

	return (
		<CenteredContainer>
			<div className="flex flex-col gap-4 rounded-b-lg border-x border-b border-light-border bg-white p-4">
				<div className="flex flex-col gap-2">
					<Link href={`/courses/${course.slug}/${lesson.slug}`}>
						<a>
							<h1 className="text-lg text-secondary">{lesson.title}</h1>
						</a>
					</Link>
					<h2 className="text-4xl">Lernkontrolle</h2>
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
		</CenteredContainer>
	);
}
