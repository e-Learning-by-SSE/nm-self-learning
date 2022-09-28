import { EditorField } from "@self-learning/ui/forms";
import { useState } from "react";
import { useQuestion } from "../../use-question-hook";

type Answer = {
	program: string;
	isCorrect: boolean;
};

export function ProgrammingAnswer() {
	const { markdown, setAnswer, answer, question } = useQuestion("programming");

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
