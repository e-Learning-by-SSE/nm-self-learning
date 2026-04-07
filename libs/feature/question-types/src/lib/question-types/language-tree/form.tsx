import { useFormContext, useWatch } from "react-hook-form";
import { QuestionTypeForm } from "../../base-question";
import { LanguageTreeQuestion } from "./schema";
import { ReactNode, useState, useEffect } from "react";
import { parseTree, TreeNode } from "./tree-parser";
import { TreeVisualization } from "./tree-visualization";
import { Dialog, DialogActions, IconOnlyButton, Toggle } from "@self-learning/ui/common";
import { CenteredContainer } from "@self-learning/ui/layouts";
import { FaceFrownIcon, TrashIcon } from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/24/solid";

export default function LanguageTreeForm({ index }: { index: number }) {
	const { control, setValue } = useFormContext<QuestionTypeForm<LanguageTreeQuestion>>();
	const languageTree = useWatch({
		name: `quiz.questions.${index}`,
		control
	});

	const getDefaultInitialTree = () => {
		if (
			languageTree.restrictNodeTypes &&
			languageTree.nodeTypeCategories?.length > 0 &&
			languageTree.nodeTypeCategories[0].nodes.length > 0
		) {
			return `[${languageTree.nodeTypeCategories[0].nodes[0]}]`;
		}
		return "[Root]";
	};

	const safeInitialTree = languageTree.initialTree || getDefaultInitialTree();
	const [initialTreeInput, setInitialTreeInput] = useState<string>(safeInitialTree);

	useEffect(() => {
		if (
			languageTree.restrictNodeTypes &&
			languageTree.nodeTypeCategories?.length > 0 &&
			languageTree.nodeTypeCategories[0].nodes.length > 0
		) {
			const firstValue = `[${languageTree.nodeTypeCategories[0].nodes[0]}]`;
			setValue(`quiz.questions.${index}.initialTree`, firstValue);
			setInitialTreeInput(firstValue);
		} else if (!languageTree.initialTree) {
			setValue(`quiz.questions.${index}.initialTree`, "[Root]");
			setInitialTreeInput("[Root]");
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [languageTree.restrictNodeTypes, languageTree.nodeTypeCategories]);

	const [answerTreeInput, setAnswerTreeInput] = useState<string[]>(languageTree.answer);

	const [editDialog, setEditDialog] = useState<ReactNode | null>(null);

	const addAnswer = (value: string) => {
		setAnswerTreeInput([...answerTreeInput, value]);
	};
	const removeAnswer = (index: number) => {
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
				<div className="flex flex-col p-4 mb-5 rounded-lg">
					<span className="text-lg font-medium mb-3">Einstellungen</span>
					<div className="flex flex-row">
						<Toggle
							value={languageTree.restrictNodeTypes ?? false}
							onChange={value => {
								setValue(`quiz.questions.${index}.restrictNodeTypes`, value);
								if (value) {
									// When restriction is turned ON, reset caseSensitive
									setValue(`quiz.questions.${index}.caseSensitive`, false);
								}
							}}
							label={"Knotentypen einschränken"}
						/>
					</div>

					{!languageTree.restrictNodeTypes && (
						<div className="flex flex-row mt-2">
							<Toggle
								value={languageTree.caseSensitive}
								onChange={value =>
									setValue(`quiz.questions.${index}.caseSensitive`, value)
								}
								label={"Groß- und Kleinschreibung beachten"}
							/>
						</div>
					)}

					{languageTree.restrictNodeTypes && (
						<>
							<div className="mt-4 border rounded-lg p-4">
								<div className="flex items-center justify-between mb-3">
									<span className="font-medium">Kategorien</span>
									<button
										type="button"
										className="btn-primary text-sm px-3 py-1"
										onClick={() => {
											const current = languageTree.nodeTypeCategories ?? [];
											setValue(`quiz.questions.${index}.nodeTypeCategories`, [
												...current,
												{ name: "", nodes: [] }
											]);
										}}
									>
										+ Kategorie hinzufügen
									</button>
								</div>

								{(languageTree.nodeTypeCategories ?? []).map(
									(category, catIndex) => (
										<div
											key={catIndex}
											className="flex flex-col gap-2 mb-3 p-3 border rounded-lg bg-c-surface-1"
										>
											<div className="flex items-center gap-2">
												<input
													type="text"
													className="border rounded px-2 py-1 text-sm flex-1"
													placeholder="Kategoriename (z. B. Nomen)"
													value={category.name}
													onChange={e => {
														const current = [
															...(languageTree.nodeTypeCategories ??
																[])
														];
														current[catIndex] = {
															...current[catIndex],
															name: e.target.value
														};
														setValue(
															`quiz.questions.${index}.nodeTypeCategories`,
															current
														);
													}}
												/>
												<button
													type="button"
													className="p-1 bg-c-danger text-white rounded hover:bg-c-danger-strong"
													onClick={() => {
														const current = [
															...(languageTree.nodeTypeCategories ??
																[])
														];
														current.splice(catIndex, 1);
														setValue(
															`quiz.questions.${index}.nodeTypeCategories`,
															current
														);
													}}
												>
													<TrashIcon className="h-4 w-4" />
												</button>
											</div>
											<input
												type="text"
												className="border rounded px-2 py-1 text-sm"
												placeholder="Wörter, kommagetrennt (z. B. Tisch, Fenster, Tür)"
												defaultValue={category.nodes.join(", ")}
												onBlur={e => {
													const current = [
														...(languageTree.nodeTypeCategories ?? [])
													];
													current[catIndex] = {
														...current[catIndex],
														nodes: e.target.value
															.split(",")
															.map(s => s.trim())
															.filter(Boolean)
													};
													setValue(
														`quiz.questions.${index}.nodeTypeCategories`,
														current
													);
												}}
											/>
										</div>
									)
								)}
							</div>

							<p className="text-sm text-yellow-600 bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
								⚠️ Hinweis: Wenn Knotentypen eingeschränkt sind, sollten die Werte
								im Anfangsbaum mit den definierten Kategoriewörtern übereinstimmen.
								Andernfalls kann es zu inkonsistenter Darstellung für Studierende
								kommen.
							</p>
						</>
					)}
				</div>

				<div className="flex flex-col p-4 mb-5 rounded-lg">
					<div className="flex items-center gap-4 py-6">
						<h5 className="text-xl font-semibold">Anfängliche Baumstruktur</h5>
						<IconOnlyButton
							icon={<PlusIcon className="h-5 w-5" />}
							className={`btn-primary ${initialTreeInput ? "invisible" : "visible"}`}
							onClick={addInitialTree}
							title={"Struktur Hinzufügen"}
						/>
					</div>
					<p className="text-sm text-gray-500 mb-3">
						Der Startbaum, den Studierende als Ausgangspunkt erhalten. Verwenden Sie die
						Klammernotation, z. B.: <code>[Wurzel [Kind1] [Kind2]]</code>
					</p>
					<div className="flex justify-center w-full h-[150px] p-4">
						{initialTreeInput ? (
							<li
								className="flex items-center w-full rounded-lg border border-c-border h-10 bg-white hover:cursor-pointer hover:bg-c-neutral-muted"
								onClick={addInitialTree}
							>
								<div className="flex w-full items-center justify-between px-4">
									<div className="flex flex-col gap-1 hover:text-c-primary">
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
				<div className="flex flex-col p-4 mb-5 rounded-lg">
					<div className="flex items-center gap-4 py-6">
						<h5 className="text-xl font-semibold">Antworten</h5>
						<IconOnlyButton
							icon={<PlusIcon className="h-5 w-5" />}
							className="btn-primary"
							onClick={addAnswerTree}
							title={"Antwort Hinzufügen"}
						/>
					</div>
					<p className="text-sm text-gray-500 mb-3">
						Definieren Sie mindestens eine korrekte Baumstruktur als Musterlösung.
					</p>
					<div className="flex justify-center w-full min-h-[150px] max-h-[300px] overflow-y-auto">
						{answerTreeInput.length > 0 ? (
							<ul className="flex flex-col items-start w-full gap-4 p-4">
								{answerTreeInput.map((answer, index) => (
									<li
										key={index}
										className="flex items-start w-full justify-start rounded-lg border border-c-border bg-white p-2 hover:cursor-pointer hover:bg-c-neutral-muted"
										onClick={e => {
											// Prevent opening the dialog when clicking on the delete button
											if ((e.target as HTMLElement).closest("button")) {
												return; // Do nothing if the click is from the delete button
											}
											setEditDialog(
												<TreeEditDialog
													value={answer}
													onClose={value => {
														if (value) {
															const newAnswerTreeInput = [
																...answerTreeInput
															];
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
											<div className="flex flex-col gap-1 hover:text-c-primary">
												<span className="truncate overflow-hidden whitespace-nowrap text-ellipsis">
													{answer}
												</span>
											</div>
											<div className="flex flex-wrap justify-end gap-4">
												<button
													className="rounded-lg bg-c-danger font-medium text-white p-1 hover:bg-c-danger-strong"
													onClick={() => removeAnswer(index)}
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
			title={"Baumstruktur bearbeiten"}
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
						<div className="bg-c-surface-1 rounded-lg flex items-center justify-center w-full h-full">
							<FaceFrownIcon className="mx-2 h-7 w-7" />{" "}
						</div>
					)}
				</div>
				<div className="py-2 mt-2">
					<p className="font-medium">Baumstruktur eingeben</p>
					<p className="text-sm text-gray-500">
						Verwenden Sie die Klammernotation: Jeder Knoten wird in eckige Klammern
						gesetzt. Kindknoten stehen innerhalb des Elternknotens, z. B.:{" "}
						<code>[Wurzel [Kind1 [Enkel1] [Enkel2]] [Kind2]]</code>
					</p>
				</div>
				<textarea
					aria-label="tree initial input"
					id="tree-input-initial"
					value={treeValue}
					onChange={e => {
						setTreeValue(e.target.value);
						handleInputChange(e.target.value, setInitialTree, setError);
					}}
					className="font-mono bg-c-surface-1 w-full"
					rows={1}
					placeholder="Geben Sie hier Ihre Baumstruktur ein"
				/>
				{error && <p className="text-c-danger mt-2">{error}</p>}
			</CenteredContainer>
			<div className="mt-auto">
				<DialogActions onClose={onClose}>
					<button
						className="btn-primary"
						disabled={error != null}
						onClick={() => onClose(treeValue)}
					>
						Speichern
					</button>
				</DialogActions>
			</div>
		</Dialog>
	);
}
