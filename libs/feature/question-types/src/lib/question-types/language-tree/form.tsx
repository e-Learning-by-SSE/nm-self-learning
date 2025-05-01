import { useFormContext, useWatch } from "react-hook-form";
import { QuestionTypeForm } from "../../base-question";
import { LanguageTreeQuestion } from "./schema";
import { ReactNode, useState } from "react";
import { parseTree, TreeNode, validateBrackets } from "./tree-parser";
import { TreeVisualization } from "./tree-visualization";
import { Dialog, DialogActions, PlusButton, Toggle } from "@self-learning/ui/common";
import { CenteredContainer } from "@self-learning/ui/layouts";
import { FaceFrownIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function LanguageTreeForm({ index }: { index: number }) {
	const { control, setValue } = useFormContext<QuestionTypeForm<LanguageTreeQuestion>>();
	const languageTree = useWatch({
		name: `quiz.questions.${index}`,
		control
	});

	const [initialTreeInput, setInitialTreeInput] = useState<string>(languageTree.initialTree);
	const [answerTreeInput, setAnswerTreeInput] = useState<string[]>(languageTree.answer);

	const [editDialog, setEditDialog] = useState<ReactNode | null>(null);

	const addAnswer = (value: string) => {
		setAnswerTreeInput([...answerTreeInput, value]);
	};
	const removeAnswer = (e: React.MouseEvent<HTMLButtonElement> ,index: number) => {
		e.stopPropagation();
		const newAnswerTreeInput = [...answerTreeInput];
		newAnswerTreeInput.splice(index, 1);
		setAnswerTreeInput(newAnswerTreeInput);
	};

	const addInitialTree = () => {
		setEditDialog(
			<TreeEditDialog
				value={initialTreeInput}
				onClose={value => {
					if (value) {
						setInitialTreeInput(value);
						setValue(`quiz.questions.${index}.initialTree`, value);
					}
					setEditDialog(null);
				}}
			/>
		);
	};
	const addAnswerTree = () => {
		setEditDialog(
			<TreeEditDialog
				value={initialTreeInput}
				onClose={value => {
					if (value) {
						addAnswer(value);
						setValue(`quiz.questions.${index}.answer`, [...answerTreeInput, value]);
					}
					setEditDialog(null);
				}}
			/>
		);
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

				<div className="flex flex-col bg-gray-50 p-4 mb-5 rounded-lg">
					<div className="flex items-center gap-4 py-6">
						<h5 className="text-xl font-semibold">Initiale Baum Struktur</h5>
						<PlusButton
							additionalClassNames={`${initialTreeInput ? "invisible" : "visible"}`}
							onAdd={addInitialTree}
							title={"Struktur Hinzufügen"}
						/>
					</div>
					<div className="flex justify-center w-full h-[150px] p-4">
						{initialTreeInput ? (
							<li className="flex items-center w-full rounded-lg border border-light-border h-10 bg-white  hover:cursor-pointer hover:bg-gray-100"
							onClick={addInitialTree}>
								<div className="flex w-full items-center justify-between px-4">
									<div className="flex flex-col gap-1 hover:text-secondary">
										<span className="truncate overflow-hidden whitespace-nowrap text-ellipsis">
											{initialTreeInput}
										</span>
									</div>
								</div>
							</li>
						) : (
							<div className="flex items-center justify-center">
								<p className="text-lg">Keine Baumstruktur vorhanden</p>
								<FaceFrownIcon className="mx-2 h-7 w-7" />
							</div>
						)}
					</div>
				</div>
				<div className="flex flex-col bg-gray-50 p-4 mb-5 rounded-lg">
					<div className="flex items-center gap-4 py-6">
						<h5 className="text-xl font-semibold">Anworten</h5>
						<PlusButton onAdd={addAnswerTree} title={"Antwort Hinzufügen"} />
					</div>
					<div className="flex justify-center w-full min-h-[150px] max-h-[300px] overflow-y-auto">
						{answerTreeInput.length > 0 ? (
							<ul className="flex flex-col items-start w-full gap-4 p-4">
								{answerTreeInput.map((answer, index) => (
									<li
										key={index}
										className="flex items-start w-full justify-start rounded-lg border border-light-border bg-white p-2 hover:cursor-pointer hover:bg-gray-100"
										onClick={() => {
											setEditDialog(
												<TreeEditDialog
													value={answer}
													onClose={value => {
														if (value) {
															const newAnswerTreeInput = [...answerTreeInput];
															newAnswerTreeInput[index] = value;
															setAnswerTreeInput(newAnswerTreeInput);
															setValue(
																`quiz.questions.${index}.answer`,
																newAnswerTreeInput
															);
														}
														setEditDialog(null);
													}}
												/>
											);
										}}
									>
										<div className="flex w-full items-center justify-between px-4">
											<div className="flex flex-col gap-1 hover:text-secondary">
												<span className="truncate overflow-hidden whitespace-nowrap text-ellipsis">
													{answer}
												</span>
											</div>
											<div className="flex flex-wrap justify-end gap-4">
												<button
													className="rounded-lg bg-red-500 font-medium text-white p-1 hover:bg-red-600"
													onClick={(e) => removeAnswer(e, index)}
												>
													<div className="ml-4">
														<TrashIcon className="icon w-5 h-5" />
													</div>
												</button>
											</div>
										</div>
									</li>
								))}
							</ul>
						) : (
							<div className="flex items-center justify-center">
								<p className="text-lg">Keine Baumstruktur vorhanden</p>
								<FaceFrownIcon className="mx-2 h-7 w-7" />
							</div>
						)}
					</div>
				</div>
			</div>
			{editDialog}
		</section>
	);
}

function TreeEditDialog({ value, onClose }: { value: string; onClose: (value?: string) => void }) {
	const [treeValue, setTreeValue] = useState(value);
	const [initialTree, setInitialTree] = useState(() => {
		try {
			return parseTree(value);
		} catch (e) {
			return null;
		}
	});

	const [error, setError] = useState<string | null>(null);

	const handleInputChange = (
		value: string,
		setTree: (tree: TreeNode | null) => void,
		setError: (error: string | null) => void
	) => {
		if (!validateBrackets(value)) {
			setError("Invalid bracket structure");
			setTree(null);
			return;
		}

		try {
			const newTree = parseTree(value);
			setTree(newTree);
			setError(null);
		} catch (e) {
			setError((e as Error).message);
			setTree(null);
		}
	};

	return (
		<Dialog
			style={{ height: "600", width: "30vw", overflow: "auto" }}
			title={"Baum Struktur bearbeiten"}
			onClose={() => {
				onClose();
			}}
		>
			<CenteredContainer>
				<div className="flex justify-center w-full h-[400px]">
					{initialTree ? (
						<TreeVisualization
							className="w-full h-[400px] p-2 rounded-lg border"
							root={initialTree}
						/>
					) : (
						<div className="bg-gray-50 rounded-lg flex items-center justify-center w-full h-full">
							<FaceFrownIcon className="mx-2 h-7 w-7" />{" "}
						</div>
					)}
				</div>
				<div className="py-2 mt-2">Baum Struktur eingeben</div>
				<textarea
					aria-label="tree initial input"
					id="tree-input-initial"
					value={treeValue}
					onChange={e => {
						setTreeValue(e.target.value);
						handleInputChange(e.target.value, setInitialTree, setError);
					}}
					className="font-mono bg-gray-50 w-full"
					rows={1}
					placeholder="Geben Sie hier Ihre Baumstruktur ein"
				/>
				{error && <p className="text-red-500 mt-2">{error}</p>}
			</CenteredContainer>
			<div className="mt-auto">
				<DialogActions onClose={onClose}>
					<button className="btn-primary" disabled={error!=null} onClick={() => onClose(treeValue)}>
						Speichern
					</button>
				</DialogActions>
			</div>
		</Dialog>
	);
}
