import { Combobox } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/24/solid";
import { trpc } from "@self-learning/api-client";
import { LearningGoal, LearningSubGoal } from "@self-learning/types";
import { Dialog, DialogActions, LoadingCircle } from "@self-learning/ui/common";
import { LabeledField } from "@self-learning/ui/forms";
import { Fragment, useState } from "react";

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
	goal?: LearningGoal;
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
	const [description, setDescription] = useState(goal?.description ?? subGoal?.description ?? "");
	const [learningGoalId, setLearningGoalId] = useState(subGoal?.learningGoalId ?? "");

	// Different label for creating or editing of a goal or sub-goal
	const title = goal || subGoal ? "Lernziel bearbeiten" : "Lernziel erstellen";

	/**
	 * Function for saving a goal or sub-goal. Contains a textarea for describing a learning goal and a combobox to select the parent goal.
	 * The combobox is only displayed for new learning goals or sub-goals.
	 */
	function save() {
		if (description.length > 0) {
			const goalId = goal?.id ?? "";
			const subGoalId = subGoal?.id ?? "";

			const date = new Date();
			const lastProgressUpdate = date.toISOString();

			if (goalId != "") {
				// Learning goal was edited
				editGoal({ description, lastProgressUpdate, goalId });
			} else if (subGoalId != "") {
				// Learning sub-goal was edited
				if (learningGoalId == "") {
					// a Sub-goal was edited and converted to a learning goal.
					createGoalFromSubGoal({ description, subGoalId });
				} else {
					// a Sub-goal was edited
					editSubGoal({ description, lastProgressUpdate, learningGoalId, subGoalId });
				}
			} else if (learningGoalId == "") {
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
		const goals = [{ id: 1, description: "Kein Ziel ausgewählt", goalId: "" }];
		let index = 2;

		_goals?.map((goal: { status: string; description: string; id: string }) => {
			if (goal.status != "COMPLETED") {
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
							<MyCombobox
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
						disabled={description.length === 0}
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
 * Combobox component for selecting the parent learning goal of a sub-goal. If nothing is selected a new learning goal will be created
 *
 * @param goals Learning goal data
 * @param pSelectedGoal Current selected goal for editing a sub-goal
 * @param onChange Function executed on change of the selected entry
 * @returns Combobox with all inprogress learning goals
 */
function MyCombobox({
	goals,
	pSelectedGoal,
	onChange
}: Readonly<{
	goals: { id: number; description: string; goalId: string }[];
	pSelectedGoal: number;
	onChange: (id: string) => void;
}>) {
	const [selectedGoal, setSelectedGoal] = useState(goals[pSelectedGoal]);
	const [query, setQuery] = useState("");

	const filteredGoals =
		query === ""
			? goals
			: goals.filter(goals => {
					return goals.description.toLowerCase().includes(query.toLowerCase());
				});

	function onSelectedGoalChange(e: { id: number; description: string; goalId: string }) {
		setSelectedGoal(e);
		onChange(e.goalId);
	}

	return (
		<Combobox value={selectedGoal} onChange={onSelectedGoalChange}>
			<div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
				<Combobox.Input
					className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
					onChange={event => setQuery(event.target.value)}
					displayValue={goal =>
						(goal as { id: number; description: string; goalId: string }).description
					}
				/>
				<Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
					<ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
				</Combobox.Button>
			</div>
			<Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
				{filteredGoals.map(goal => (
					<Combobox.Option key={goal.id} value={goal} as={Fragment}>
						{({ active }) => (
							<li
								className={`${
									active ? "bg-emerald-500 text-white" : "bg-white text-black"
								}`}
							>
								{goal.description}
							</li>
						)}
					</Combobox.Option>
				))}
			</Combobox.Options>
		</Combobox>
	);
}
