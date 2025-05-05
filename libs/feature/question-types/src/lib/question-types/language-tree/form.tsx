import { useFormContext, useWatch } from "react-hook-form";
import { QuestionTypeForm } from "../../base-question";
import { LanguageTreeQuestion } from "./schema";
import { useState } from "react";
import { parseTree, TreeNode, validateBrackets } from "./tree-parser";
import { TreeVisualization } from "./tree-visualization";
import { Toggle } from "@self-learning/ui/common";

export default function LanguageTreeForm({ index }: { index: number }) {
	const { control, setValue } = useFormContext<QuestionTypeForm<LanguageTreeQuestion>>();
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
				<div className="flex flex-col bg-gray-50 p-4 mb-5 rounded-lg">
					<span className="text-lg font-medium mb-3">Einstellungen</span>
					<div className="flex flex-row">
						<Toggle
							value={languageTree.caseSensitive}
							onChange={value =>
								setValue(`quiz.questions.${index}.caseSensitive`, value)
							}
							label={"Groß- und Kleinschreibung beachten"}
						/>
					</div>
				</div>
				<div className="space-y-2">
					<div>Initiale Baum Struktur</div>
					<textarea
						aria-label="tree initial input"
						id="tree-input-initial"
						value={initialTreeInput}
						onChange={e => {
							setInitialTreeInput(e.target.value);
							handleInputChange(
								e.target.value,
								setInitialTree,
								setInitialError,
								() => {
									setValue(`quiz.questions.${index}.initialTree`, e.target.value);
								}
							);
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
							handleInputChange(e.target.value, setAnswerTree, setAnswerError, () => {
								setValue(`quiz.questions.${index}.answer`, e.target.value);
							});
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
