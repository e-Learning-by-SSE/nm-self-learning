import { LearningGoalType } from "@self-learning/api";
import { useState } from "react";
import {
	ButtonActions,
	DialogHandler,
	SectionHeader,
	SimpleDialog,
	Tab,
	Tabs,
	dispatchDialog,
	freeDialog,
	showToast
} from "@self-learning/ui/common";
import { LearningGoal, LearningSubGoal } from "@self-learning/types";
import { CenteredSection } from "@self-learning/ui/layouts";
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/solid";
import { trpc } from "@self-learning/api-client";
import { GoalEditorDialog } from "./learning-goal-components/learning-goal-editor-dialog";
import { GoalStatus } from "./learning-goal-components/status";
import { PencilIcon } from "@heroicons/react/24/outline";

export default LearningGoals;

/**
 * Component for displaying learning goals. It contains dialogs for creating and editing of learning goals and sub-goals (Grob-/ Feinziel).
 * For every goal the status is displayed and all sub-goals.
 *
 * @param goals Learning goal data
 * @returns A component to display learning goals
 */

export function LearningGoals({
	goals,
	onEdit
}: Readonly<{
	goals: LearningGoal[] | null;
	onEdit: (editedGoal: LearningGoal) => void;
}>) {
	const [selectedTab, setSelectedTab] = useState(0);
	const [openAddDialog, setOpenAddDialog] = useState(false);

	if (!goals) {
		return <p>Keine Ziele gefunden</p>;
	}

	const inProgress = goals.filter(
		goals => goals.status == "INACTIVE" || goals.status == "ACTIVE"
	);
	const complete = goals.filter(goals => goals.status == "COMPLETED");

	return (
		<CenteredSection className="overflow-y-auto bg-gray-50 pb-32">
			<section>
				<div className="flex items-center justify-between gap-4">
					<SectionHeader title="Meine Lernziele" />
					<button className="btn-primary" onClick={() => setOpenAddDialog(true)}>
						<PlusIcon className="icon h-5" />
						<span>Lernziel hinzufügen</span>
					</button>
				</div>

				<div className="py-2 ">
					{selectedTab === 0 && (
						<TabContent
							selectedTab={selectedTab}
							setSelectedTab={setSelectedTab}
							goals={inProgress}
							notFoundMessage={"Derzeit ist kein Ziel erstellt worden."}
							editable={true}
							onEdit={onEdit}
						/>
					)}
					{selectedTab === 1 && (
						<TabContent
							selectedTab={selectedTab}
							setSelectedTab={setSelectedTab}
							goals={complete}
							notFoundMessage={"Derzeit ist kein Ziel abgeschlossen."}
							editable={false}
							onEdit={onEdit}
						/>
					)}
				</div>
			</section>
			{openAddDialog && <GoalEditorDialog onClose={() => setOpenAddDialog(false)} />}
			<DialogHandler id={"simpleGoalDialog"} />
		</CenteredSection>
	);
}

/** Component for the Overview of goals. Contains a row for every learning goal of the learning goal data.
 *
 * @param goals Learning goals data
 * @param notFoundMessage Message if data does not contain any goals
 * @param editable Shows whether a goal can be edited
 * @returns Component to display the all goals
 */

export function GoalsOverview({
	goals,
	notFoundMessage,
	editable,
	onEdit
}: Readonly<{
	goals: LearningGoalType | null;
	notFoundMessage: string;
	editable: boolean;
	onEdit: (editedGoal: LearningGoal) => void;
}>) {
	if (!goals) {
		return <p>Keine Ziele Gefunden.</p>;
	}

	return (
		<div>
			{goals.length > 0 ? (
				<ul className="space-y-4">
					{goals.map(goal => (
						<GoalRow
							onEdit={onEdit}
							key={goal.id}
							goal={goal}
							editable={editable}
							goals={goals}
						/>
					))}
				</ul>
			) : (
				<p className="text-center">{notFoundMessage}</p>
			)}
		</div>
	);
}

/**
 * Component to display the content of a tab.
 *
 * @param selectedTab Current selected tab
 * @param setSelectedTab Function to set the current selected tab
 * @param goals Learning goals data
 * @param notFoundMessage Message if data does not contain any goals
 * @param editable Shows whether a goal can be edited
 * @returns
 */
function TabContent({
	selectedTab,
	setSelectedTab,
	goals,
	notFoundMessage,
	editable,
	onEdit
}: Readonly<{
	selectedTab: number;
	setSelectedTab: (v: number) => void;
	goals: LearningGoalType | null;
	notFoundMessage: string;
	editable: boolean;
	onEdit: (editedGoal: LearningGoal) => void;
}>) {
	return (
		<div className="xl:grid-cols grid h-full gap-8">
			<div>
				<Tabs selectedIndex={selectedTab} onChange={v => setSelectedTab(v)}>
					<Tab>In Bearbeitung</Tab>
					<Tab>Abgeschlossen</Tab>
				</Tabs>
				<div className={"pt-4"}>
					<GoalsOverview
						goals={goals}
						notFoundMessage={notFoundMessage}
						editable={editable}
						onEdit={onEdit}
					/>
				</div>
			</div>
		</div>
	);
}

/**
 * Component to display a row for a learning goal with separate rows for each sub goal.
 *
 * @param goal Learning goal data for the row
 * @param goals Learning goals data
 * @param editable Shows whether a goal can be edited
 * @returns
 */
function GoalRow({
	goal,
	editable,
	goals,
	onEdit
}: Readonly<{
	goal: LearningGoal;
	editable: boolean;
	goals: LearningGoal[];
	onEdit: (editedGoal: LearningGoal) => void;
}>) {
	const [openAddDialog, setOpenAddDialog] = useState(false);

	if (goal && goal.status != "COMPLETED" && goal.learningSubGoals.length > 0) {
		const index = goal.learningSubGoals.findIndex(
			goal => goal.status == "INACTIVE" || goal.status == "ACTIVE"
		);
		if (index < 0) {
			showToast({
				type: "success",
				title: '"' + goal.description + '"' + " kann abgeschlossen werden!",
				subtitle: "Alle Feinziele erreicht!"
			});
		}
	}

	return (
		<section>
			<li className="flex flex-col gap-2 rounded-lg bg-gray-100 p-4">
				<div className="flex w-full flex-row justify-between">
					<div className="group flex flex-row">
						<div className="mb-2 text-xl font-semibold">{goal.description}</div>
						{goal.status != "COMPLETED" && editable && (
							<div className="invisible flex flex-row group-hover:visible">
								<QuickEditButton onClick={() => setOpenAddDialog(true)} />
								<GoalDeleteOption
									goalId={goal.id}
									isSubGoal={false}
									className="px-2 hover:text-secondary"
								/>
							</div>
						)}
					</div>
					<div className="mr-4 flex justify-end">
						<GoalStatus goal={goal} editable={editable} onEdit={onEdit} />
					</div>
				</div>
				<ul className="flex flex-col gap-1">
					{goal.learningSubGoals.map(subGoal => (
						<SubGoalRow
							key={subGoal.id}
							subGoal={subGoal}
							editable={editable}
							goals={goals}
							goal={goal}
							onEdit={onEdit}
						/>
					))}
				</ul>
			</li>
			{openAddDialog && (
				<GoalEditorDialog goal={goal} onClose={() => setOpenAddDialog(false)} />
			)}
		</section>
	);
}

/**
 * Component to display a row for a learning sub-goal. Contains a dialog for editing sub-goals. Buttons to change the priority (up or down).
 *
 * @param subGoal Learning sub-goal data for the row
 * @param goals Learning goals data
 * @param editable Shows whether a goal can be edited
 * @returns
 */
function SubGoalRow({
	subGoal,
	editable,
	goals,
	goal,
	onEdit
}: Readonly<{
	subGoal: LearningSubGoal;
	editable: boolean;
	goals: LearningGoal[];
	goal: LearningGoal;
	onEdit: (editedGoal: LearningGoal) => void;
}>) {
	const [openAddDialog, setOpenAddDialog] = useState(false);
	const { mutateAsync: editSubGoalPriority } =
		trpc.learningGoal.editSubGoalPriority.useMutation();

	/**
	 * function to move a sub-goal up or down.
	 *
	 * @param subGoal Sub-goal data
	 * @param direction Direction of the move "up" or "down"
	 * @param subGoals All sub-goals data of the parent goal
	 */
	function moveSubGoal(subGoal: LearningSubGoal, direction: string, subGoals: LearningSubGoal[]) {
		let found;
		// If up identify the goal with the next higher priority and switch priorities.
		if (direction == "up") {
			subGoals.sort((a, b) => (a.priority > b.priority ? -1 : 1));
			found = subGoals.find(goal => {
				return goal.priority <= subGoal.priority - 1;
			});
			if (found) {
				editSubGoalPriority({ priority: found.priority, subGoalId: subGoal.id });
				editSubGoalPriority({ priority: subGoal.priority, subGoalId: found.id });
			}
			// If down identify the goal with the next lower priority and switch priorities.
		} else if (direction == "down") {
			subGoals.sort((a, b) => (a.priority < b.priority ? -1 : 1));
			found = subGoals.find(goal => {
				return goal.priority >= subGoal.priority + 1;
			});
			if (found) {
				editSubGoalPriority({ priority: found.priority, subGoalId: subGoal.id });
				editSubGoalPriority({ priority: subGoal.priority, subGoalId: found.id });
			}
		}
	}

	const result = goals.filter(goal => {
		return goal.id === subGoal.learningGoalId;
	});
	let max;
	if (result.length > 0)
		max = result[0].learningSubGoals.reduce((a, b) =>
			a.priority > b.priority ? a : b
		).priority;

	return (
		<span className="flex w-full justify-between gap-4 rounded-lg bg-white px-4 py-2">
			<div className="flex w-full gap-8">
				<div className="flex w-full flex-row justify-between">
					<div className="group flex flex-row">
						<div className="flex gap-4">
							<button
								type="button"
								title="Nach oben"
								className="rounded p-1 hover:bg-gray-200"
								onClick={() =>
									moveSubGoal(subGoal, "up", result[0].learningSubGoals)
								}
								hidden={subGoal.priority == 1 || !editable}
							>
								<ArrowUpIcon className="h-3" />
							</button>
							{(subGoal.priority == 1 || !editable) && <div className="p-2.5" />}
							<button
								type="button"
								title="Nach unten"
								className="rounded p-1 hover:bg-gray-200"
								onClick={() =>
									moveSubGoal(subGoal, "down", result[0].learningSubGoals)
								}
								hidden={subGoal.priority == max || !editable}
							>
								<ArrowDownIcon className="h-3" />
							</button>
							{(subGoal.priority == max || !editable) && <div className="p-2.5" />}
						</div>
						<div className="ml-2 flex flex-row">
							<span>{subGoal.description}</span>

							{editable && (
								<div className="invisible group-hover:visible">
									<QuickEditButton onClick={() => setOpenAddDialog(true)} />
									<GoalDeleteOption
										goalId={subGoal.id}
										isSubGoal={true}
										className="px-2 hover:text-secondary"
									/>
								</div>
							)}
						</div>
					</div>
					<div className="flex justify-end">
						<GoalStatus
							goal={goal}
							onEdit={onEdit}
							subGoal={subGoal}
							editable={editable}
						/>
					</div>
				</div>
			</div>
			{openAddDialog && (
				<GoalEditorDialog subGoal={subGoal} onClose={() => setOpenAddDialog(false)} />
			)}
		</span>
	);
}

/**
 * Component to open the editor for a learning goal.
 *
 * @param onClick Function performed if the button was clicked.
 * @returns A Button with a pencil icon.
 */
function QuickEditButton({ onClick }: Readonly<{ onClick: () => void }>) {
	return (
		<button title="Bearbeiten" className="px-2 hover:text-secondary" onClick={onClick}>
			<PencilIcon className="h-5 text-lg" />
		</button>
	);
}

/**
 * Component to handle deletion of a learning goal. Contains a warning dialog.
 *
 * @param goalId ID of a goal.
 * @param className ClassName string for the component styling (optional)
 * @param isSubGoal Distinction between learning goal and sub-goal.
 * @param onDeleteSuccess Function that is executed when a goal has been successfully deleted
 * @returns
 */

export function GoalDeleteOption({
	goalId,
	className,
	isSubGoal,
	onDeleteSuccess
}: Readonly<{
	goalId: string;
	className?: string;
	isSubGoal: boolean;
	onDeleteSuccess?: () => void | PromiseLike<void>;
}>) {
	const { mutateAsync: deleteGoal } = trpc.learningGoal.deleteGoal.useMutation();
	const { mutateAsync: deleteSubGoal } = trpc.learningGoal.deleteSubGoal.useMutation();
	const onClose = async () => {
		await withErrorHandling(async () => {
			if (isSubGoal) await deleteSubGoal({ goalId: goalId });
			else await deleteGoal({ goalId: goalId });
			await onDeleteSuccess?.();
		});
	};

	/**
	 * Handle for deleting a goal. Show a simple Dialog with a warning.
	 */
	const handleDelete = () => {
		dispatchDialog(
			<SimpleDialog
				name="Warnung"
				onClose={async (type: ButtonActions) => {
					if (type === ButtonActions.CANCEL) {
						freeDialog("simpleGoalDialog");
						return;
					}
					onClose();
					freeDialog("simpleGoalDialog");
				}}
			>
				Soll das Lernziel wirklich gelöscht werden?
			</SimpleDialog>,
			"simpleGoalDialog"
		);
	};

	return (
		<button
			type="button"
			className={` ${
				className
					? className
					: "rounded-lg border border-light-border bg-red-400 px-2 py-2 hover:bg-red-600"
			}`}
			onClick={handleDelete}
		>
			<TrashIcon className="h-5 " style={{ cursor: "pointer" }} />
		</button>
	);
}

/**
 * Error handling and notification if a goal has been successfully deleted.
 *
 * @param fn
 */
const withErrorHandling = async (fn: () => Promise<void>) => {
	try {
		await fn();
		showToast({
			type: "success",
			title: "Aktion erfolgreich!",
			subtitle: ""
		});
	} catch (error) {
		if (error instanceof Error) {
			showToast({
				type: "error",
				title: "Ihre Aktion konnte nicht durchgeführt werden",
				subtitle: error.message ?? ""
			});
		}
		console.log("Could not change goal:", error);
	}
};
