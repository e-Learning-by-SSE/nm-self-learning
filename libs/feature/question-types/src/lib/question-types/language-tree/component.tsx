import { useQuestion } from "../../use-question-hook";
import { TreeEditor } from "./TreeEditor";
import { TreeVisualization } from "./tree-visualization";
import { useState } from "react";
import { parseTree } from "./tree-parser";
import { Feedback } from "../../feedback";

export default function LanguageTreeAnswer() {
	const { question,  setAnswer, evaluation } = useQuestion("language-tree");
	const [input, setInput] = useState(question.initialTree);
	const [tree, setTree] = useState(() => {
		try {
			return parseTree(input);
		} catch (e) {
            setError((e as Error).message);
			return null;
		}
	});
    const [error, setError] = useState<string | null>(null);


    const onInputChange = (value: string) => {
       setAnswer({
            questionId: question.questionId,
            type: question.type,
            value
        });
       setInput(value);
    }

	return (
		<section className="bg-white p-4 rounded-lg">
				{tree && (
					<div className="flex">
						<div className="w-1/2 p-4 border-r">
							<TreeEditor tree={tree} setTree={setTree} setInput={onInputChange} />
						</div>
						<div className="w-1/2 h-[400px]">
							<TreeVisualization root={tree} />
						</div>
					</div>
				)}
			<div className="space-y-2">
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
					className="font-mono bg-gray-50 w-full"
					rows={5}
				/>
				{error && <p className="text-red-500 mt-2">{error}</p>}
			</div>

			{evaluation && (
				<Feedback isCorrect={evaluation.isCorrect}>
					<div className="flex flex-col gap-2">
                        Richtig
					</div>
				</Feedback>
			)}
		</section>
	);
}
