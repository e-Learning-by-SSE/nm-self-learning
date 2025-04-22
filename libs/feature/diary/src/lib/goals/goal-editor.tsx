import { Combobox, Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon, ChevronUpDownIcon } from "@heroicons/react/24/solid";
import { trpc } from "@self-learning/api-client";
import { LearningSubGoal } from "@self-learning/types";
import { Dialog, DialogActions, LoadingCircle } from "@self-learning/ui/common";
import { LabeledField } from "@self-learning/ui/forms";
import { Fragment, useState } from "react";
import { Goal, StatusUpdateCallback } from "../util/types";
import { LearningGoals } from "./learning-goals";

/**
 * Component to display an editor dialog for a learning goal or sub-goal.
 *
 * @param goal Learning goal data
 * @param subGoal Sub-goal data
 * @param onClose Function that is executed after closing the dialog
 * @returns
 */
export function GoalEditorDialog({
	goal,
	subGoal,
	onClose
}: Readonly<{
	goal?: Goal;
	subGoal?: LearningSubGoal;
	onClose: () => void;
}>) {
	const { data: _goals, isLoading } = trpc.learningGoal.getAll.useQuery();
	const { mutateAsync: editSubGoal } = trpc.learningGoal.editSubGoal.useMutation();
	const { mutateAsync: editGoal } = trpc.learningGoal.editGoal.useMutation();
	const { mutateAsync: createSubGoal } = trpc.learningGoal.createSubGoal.useMutation();
	const { mutateAsync: createGoal } = trpc.learningGoal.createGoal.useMutation();
	const { mutateAsync: createGoalFromSubGoal } =
		trpc.learningGoal.createGoalFromSubGoal.useMutation();
	const [description, setDescriptionState] = useState(
		goal?.description.trim() ?? subGoal?.description.trim() ?? ""
	);
	const setDescription = (desc: string) => setDescriptionState(desc.trim());

	const [learningGoalId, setLearningGoalId] = useState(subGoal?.learningGoalId ?? "");

	// Different label for creating or editing of a goal or sub-goal
	const title = goal || subGoal ? "Lernziel bearbeiten" : "Lernziel erstellen";

	/**
	 * Function for saving a goal or sub-goal. Contains a textarea for describing a learning goal and a combobox to select the parent goal.
	 * The combobox is only displayed for new learning goals or sub-goals.
	 */
	function save() {
		if (description.length > 4) {
			const goalId = goal?.id ?? "";
			const subGoalId = subGoal?.id ?? "";

			const date = new Date();
			const lastProgressUpdate = date.toISOString();

			if (goalId !== "") {
				// Learning goal was edited
				editGoal({ description, lastProgressUpdate, goalId });
			} else if (subGoalId !== "") {
				// Learning sub-goal was edited
				if (learningGoalId === "") {
					// a Sub-goal was edited and converted to a learning goal.
					createGoalFromSubGoal({ description, subGoalId });
				} else {
					// a Sub-goal was edited
					editSubGoal({ description, lastProgressUpdate, learningGoalId, subGoalId });
				}
			} else if (learningGoalId === "") {
				// a new learning goal was created
				createGoal({ description });
			} else {
				// a new sub-goal was created and added to the parent goal "learningGoalId"
				createSubGoal({ description, learningGoalId });
			}
		}
		onClose();
	}

	if (isLoading)
		return (
			<div className="flex h-screen bg-gray-50">
				<div className="m-auto">
					<LoadingCircle />
				</div>
			</div>
		);
	else {
		const goals: { id: number; description: string; goalId: string }[] = [
			{ id: 1, description: "Kein Ziel ausgewählt", goalId: "" }
		];
		let index = 2;

		_goals?.forEach((goal: { status: string; description: string; id: string }) => {
			if (goal.status !== "COMPLETED") {
				goals.push({ id: index, description: goal.description, goalId: goal.id });
				index++;
			}
		});
		let selectedGoal = goals.findIndex(goal => goal.goalId === subGoal?.learningGoalId);
		if (selectedGoal < 0) selectedGoal = 0;
		return (
			<Dialog title={title} onClose={save}>
				<div className="flex flex-col gap-4">
					<LabeledField label="Beschreibung" optional={false}>
						<textarea
							className="textfield"
							rows={5}
							value={description}
							onChange={e => setDescription(e.target.value)}
						/>
					</LabeledField>
					{!goal && (
						<LabeledField label="Übergeordnetes Ziel (optional)">
							<span className="text-sm">
								Durch Auswahl eines übergeordneten Ziels erstellen Sie ein neues
								Feinziel
							</span>
							<GoalDropDownSelector
								goals={goals}
								pSelectedGoal={selectedGoal}
								onChange={(id: string) => setLearningGoalId(id)}
							/>
						</LabeledField>
					)}
				</div>

				<DialogActions onClose={save}>
					<button
						type="button"
						className="btn-primary"
						title={
							description.length < 5
								? "Description must be at least 5 characters long"
								: "Speichern"
						}
						disabled={description.length < 5}
						onClick={() => save()}
					>
						Speichern
					</button>
				</DialogActions>
			</Dialog>
		);
	}
}



/**
 * Dropdown menu component for selecting the parent learning goal of a sub-goal.
 * If no goal is selected, a new learning goal will be created.
 *
 * This component uses Headless UI's Menu for rendering the dropdown.
 *
 * Props:
 * @param goals - Array of learning goals with id, description, and goalId.
 * @param pSelectedGoal - Index of the currently selected goal for a sub-goal.
 * @param onChange - Callback triggered when a goal is selected. Receives the goalId.
 *
 * @returns A dropdown menu listing all in-progress learning goals.
 */
export function GoalDropDownSelector({
	goals,
	pSelectedGoal,
	onChange
}: {
	goals: { id: number; description: string; goalId: string }[];
	pSelectedGoal: number;
	onChange: (id: string) => void;
}) {
	const [selectedGoal, setSelectedGoal] = useState(goals[pSelectedGoal]);

	function onSelectedGoalChange(goal: { id: number; description: string; goalId: string }) {
		setSelectedGoal(goal);
		onChange(goal.goalId);
	}

	return (
		<Menu>
			{({ open }) => (
				<>
					<div>
						<MenuButton className="inline-flex justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none">
							{selectedGoal.description}
							<ChevronDownIcon
								className={`w-5 h-5 ml-2 -mr-1 text-gray-400 transform transition-transform ${
									open ? "rotate-180" : "rotate-0"
								}`}
								aria-hidden="true"
							/>
						</MenuButton>
					</div>
					<MenuItems className="absolute right-0 z-10 mt-2 w-full origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
						{goals.map(goal => (
							<MenuItem key={goal.id}>
								{({ focus }) => (
									<button
										type={"button"}
										onClick={() => onSelectedGoalChange(goal)}
										className={`${
											focus ? "bg-emerald-500 text-white" : "text-gray-900"
										} group flex rounded-md items-center w-full px-2 py-2 text-sm`}
									>
										{goal.description}
									</button>
								)}
							</MenuItem>
						))}
					</MenuItems>
				</>
			)}
		</Menu>
	);
}

export function LearningGoalEditorDialog({
	onClose,
	onStatusUpdate,
	description
}: {
	onClose: () => void;
	onStatusUpdate: StatusUpdateCallback;
	description: string;
}) {
	const { data: learningGoals, isLoading } = trpc.learningGoal.loadLearningGoal.useQuery();

	if (!learningGoals || isLoading) {
		return <LoadingCircle />;
	}
	return (
		<Dialog title="Lernziel Editor" onClose={onClose}>
			<div className="overflow-y-auto mb-2">
				<div className="space-y-4">
					<div className="max-w-md py-2">
						<span>{description}</span>
					</div>
				</div>
				<div className={"flex justify-center py-4"}>
					<LearningGoals goals={learningGoals} onStatusUpdate={onStatusUpdate} />
				</div>
			</div>
			<div className="flex justify-end">
				<button type="button" className="btn-primary" onClick={onClose}>
					Schließen
				</button>
			</div>
		</Dialog>
	);
}
