import { EditorField } from "@self-learning/ui/forms";
import { useState } from "react";
import { BaseQuestion } from "./base-question";
import { useQuestion } from "./question";

export type ProgrammingQuestion = BaseQuestion & {
	type: "programming";
	answers: null;
	language: string;
	template: string;
	expectedOutput: string;
};

type Answer = {
	program: string;
	isCorrect: boolean;
};

export function ProgrammingAnswer({ question }: { question: ProgrammingQuestion }) {
	const { markdown, setAnswer, answer } = useQuestion<"programming", Answer>();

	const [program, setProgram] = useState(question.template);

	return (
		<div className="flex flex-col gap-4">
			<EditorField
				label="Code"
				value={program}
				onChange={setProgram as any}
				language={question.language}
			/>

			<button className="btn-primary w-fit self-end">Ausführen</button>
		</div>
	);
}
