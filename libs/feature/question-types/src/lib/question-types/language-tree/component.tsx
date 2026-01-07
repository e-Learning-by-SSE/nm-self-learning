import { useQuestion } from "../../use-question-hook";
import { TreeEditor } from "./TreeEditor";
import { TreeVisualization } from "./tree-visualization";
import { useState } from "react";
import { parseTree } from "./tree-parser";
import { Feedback } from "../../feedback";

export default function LanguageTreeAnswer() {
	const { question, setAnswer, evaluation } = useQuestion("language-tree");
	const [input, setInput] = useState(question.initialTree);
	const [error, setError] = useState<string | null>(null);
	const [tree, setTree] = useState(() => {
		try {
			return parseTree(input);
		} catch (e) {
			setError((e as Error).message);
			return null;
		}
	});

	const onInputChange = (value: string) => {
		setAnswer({
			questionId: question.questionId,
			type: question.type,
			value
		});
		setInput(value);
	};

	return (
		<section className="bg-white p-4 rounded-lg">
			{tree && (
				<div className="flex max-h-600px overflow-hidden">
					<div className="w-1/2 p-4 border-r  max-h-[500px] overflow-y-auto">
						<TreeEditor
							tree={tree}
							setTree={setTree}
							setInput={onInputChange}
							allowTextInputForParents={question.customTextInputInParentNodes}
						/>
					</div>
					<div className="w-1/2">
						<TreeVisualization className="h-[500px]" root={tree} />
					</div>
				</div>
			)}
			<div className="space-y-2 mt-4">
				<div>
					Syntax Baum Struktur
					<span className="block text-sm text-muted-foreground">
						Dies ist eine schreibgeschützte Ansicht der Baumstruktur in Klammernotation.
						Verwenden Sie den Baum-Editor oben, um Änderungen vorzunehmen.
					</span>
				</div>
				<textarea
					aria-label="tree input"
					id="tree-input"
					value={input}
					readOnly
					disabled
					className="font-mono bg-c-surface-1 w-full"
					rows={5}
				/>
				{error && <p className="text-c-danger mt-2">{error}</p>}
			</div>

			{evaluation && (
				<Feedback isCorrect={evaluation.isCorrect}>
					<div className="flex flex-col gap-2">Richtig</div>
				</Feedback>
			)}
		</section>
	);
}
