import { MDXRemote } from "next-mdx-remote";
import type { compileMarkdown } from "@self-learning/markdown";
import { MultipleChoiceAnswer } from "./multiple-choice";
import { LightBulbIcon } from "@heroicons/react/outline";
import { BaseQuestion } from "./base-question";
import { ShortTextAnswer, ShortTextQuestion } from "./short-text";
import { TextAnswer, TextQuestion } from "./text";

export type QuestionType = MultipleChoiceQuestion | ShortTextQuestion | TextQuestion;

export type MultipleChoiceQuestion = BaseQuestion & {
	type: "multiple-choice";
	answers: {
		answerId: string;
		content: string;
		isCorrect: boolean;
	}[];
};

type MdLookup = { [id: string]: ResolvedValue<typeof compileMarkdown> };

export function Question({
	question,
	markdown
}: {
	question: QuestionType;
	markdown: {
		questionsMd: MdLookup;
		answersMd: MdLookup;
		hintsMd: MdLookup;
	};
}) {
	return (
		<div className="prose prose-indigo max-w-full">
			<div className="mb-1 font-semibold text-secondary">{question.type}</div>

			<div className="flex flex-col gap-12">
				{markdown.questionsMd[question.questionId] ? (
					<div>
						<MDXRemote {...markdown.questionsMd[question.questionId]} />
					</div>
				) : (
					<span className="text-red-500">Error: No markdown content found.</span>
				)}

				<div className="flex flex-col gap-8">
					<Answer question={question} answersMd={markdown.answersMd} />
				</div>

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
		</div>
	);
}

function Answer({ question, answersMd }: { question: QuestionType; answersMd: MdLookup }) {
	if (question.type === "multiple-choice") {
		return (
			<>
				{question.answers.map(answer => (
					<MultipleChoiceAnswer
						key={answer.answerId}
						content={
							answersMd[answer.answerId] ? (
								<MDXRemote {...answersMd[answer.answerId]} />
							) : (
								<span className="text-red-500">
									Error: No markdown content found.
								</span>
							)
						}
					/>
				))}
			</>
		);
	}

	if (question.type === "short-text") {
		return <ShortTextAnswer />;
	}

	if (question.type === "text") {
		return <TextAnswer />;
	}

	return (
		<span className="text-red-500">
			Error: No implementation found for "{(question as any).type}".
		</span>
	);
}
