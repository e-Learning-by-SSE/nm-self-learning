import {  useFormContext, useWatch } from "react-hook-form";
import { QuestionTypeForm } from "../../base-question";
import { LanguageTreeQuestion } from "./schema";
import { useState } from "react";
import { parseTree, TreeNode, validateBrackets } from "./tree-parser";
import { TreeVisualization } from "./tree-visualization";

export default function LanguageTreeForm({ index }: { index: number }) {
	const { control, setValue} = useFormContext<QuestionTypeForm<LanguageTreeQuestion>>();
    const languageTree = useWatch({
		name: `quiz.questions.${index}`,
		control
	});

	const [initialTreeInput, setInitialTreeInput] = useState<string>(languageTree.initialTree);
	const [answerTreeInput, setAnswerTreeInput] = useState<string>(languageTree.answer);

	const [initialTree, setInitialTree] = useState(() => {
		try {
			return parseTree(initialTreeInput);
		} catch (e) {
			return null;
		}
	});
	const [answerTree, setAnswerTree] = useState(() => {
		try {
			return parseTree(answerTreeInput);
		} catch (e) {
			return null;
		}
	});

	const [initialError, setInitialError] = useState<string | null>(null);
	const [answerError, setAnswerError] = useState<string | null>(null);


	const handleInputChange = (
		value: string,
		setTree: (tree: TreeNode | null) => void,
		setError: (error: string | null) => void,
        setQuestion: (question: string) => void
	) => {
		if (!validateBrackets(value)) {
			setError("Invalid bracket structure");
			setTree(null);
			return;
		}

		try {
			const newTree = parseTree(value);
            setQuestion(value);
			setTree(newTree);
			setError(null);
		} catch (e) {
			setError((e as Error).message);
			setTree(null);
		}
	};

	return (
		<section>
			<div className="p-4">
				<div className="space-y-2">
					<div>Initiale Baum Struktur</div>
					<textarea
						aria-label="tree initial input"
						id="tree-input-initial"
						value={initialTreeInput}
						onChange={e => {
							setInitialTreeInput(e.target.value);
							handleInputChange(e.target.value, 
                                setInitialTree,
                                 setInitialError,
                                 () =>{
                                    setValue(`quiz.questions.${index}.initialTree`, e.target.value)
                                 })
						}}
						className="font-mono bg-gray-50 w-full"
						rows={5}
					/>
					{initialError && <p className="text-red-500 mt-2">{initialError}</p>}
				</div>
				<div className="flex justify-center w-full h-[400px]">
					{initialTree && <TreeVisualization root={initialTree} />}
				</div>
				<div className="space-y-2">
					<div>Lösung der Baumstruktur</div>
					<textarea
						aria-label="tree answer input"
						id="tree-input-answer"
						value={answerTreeInput}
						onChange={e => {
							setAnswerTreeInput(e.target.value);
							handleInputChange(e.target.value, setAnswerTree, setAnswerError,  () =>{
                                setValue(`quiz.questions.${index}.answer`, e.target.value)
                             })
						}}
						className="font-mono bg-gray-50 w-full"
						rows={5}
					/>
					{answerError && <p className="text-red-500 mt-2">{answerError}</p>}
				</div>
				<div className="flex justify-center w-full h-[400px]">
					{answerTree && <TreeVisualization root={answerTree} />}
				</div>
			</div>
		</section>
	);
}
