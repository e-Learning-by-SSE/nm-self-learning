import { useEffect, useState } from "react";
import {
	ButtonActions,
	DialogHandler,
	dispatchDialog,
	freeDialog,
	SectionHeader,
	showToast,
	SimpleDialog,
	Tab,
	Tabs
} from "@self-learning/ui/common";
import { LearningSubGoal } from "@self-learning/types";
import { CenteredSection } from "@self-learning/ui/layouts";
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/solid";
import { trpc } from "@self-learning/api-client";
import { GoalEditorDialog } from "./goal-editor";
import { GoalStatus } from "./status";
import { PencilIcon } from "@heroicons/react/24/outline";
import { Goal, LearningGoalType, StatusUpdateCallback } from "../util/types";
import { LearningGoalProvider, useLearningGoalContext } from "./goal-context";

/**
 * Component for displaying learning goals. It contains dialogs for creating and editing of learning goals and sub-goals (Grob-/ Feinziel).
 * For every goal the status is displayed and all sub-goals.
 *
 * @param goals Learning goal data
 * @returns A component to display learning goals
 */
export function LearningGoals({
	goals,
	onStatusUpdate
}: {
	goals: LearningGoalType[];
	onStatusUpdate: StatusUpdateCallback;
}) {
	const [selectedTab, setSelectedTab] = useState(0);
	const [editTarget, setEditTarget] = useState<Goal | null>(null);
	const [openAddDialog, setOpenAddDialog] = useState(false);

	const { mutateAsync: editSubGoalPriority } =
		trpc.learningGoal.editSubGoalPriority.useMutation();

	// eslint does not understand it is used in moveSubGoal()
	// eslint-disable-next-line prefer-const
	let inProgress = goals.filter(g => g.status === "INACTIVE" || g.status === "ACTIVE");
	const complete = goals.filter(g => g.status === "COMPLETED");

	const handleEditTarget = (editedGoal: Goal) => {
		setEditTarget(editedGoal);
	};

	/**
	 * function to move a sub-goal up or down.
	 *
	 * @param subGoal Sub-goal data
	 * @param direction Direction of the move "up" or "down"
	 * @param subGoals All sub-goals data of the parent goal
	 */
	function moveSubGoal(subGoal: LearningSubGoal, direction: string, subGoals: LearningSubGoal[]) {
		function switchGoals(subGoalA: LearningSubGoal, subGoalB: LearningSubGoal) {
			const goalIndex = inProgress.findIndex(goal => goal.learningSubGoals === subGoals);
			const learningSubGoals = inProgress[goalIndex].learningSubGoals;

			const indexA = learningSubGoals.indexOf(subGoalA);
			const indexB = learningSubGoals.indexOf(subGoalB);

			const subGoalAItem = learningSubGoals[indexA];
			const subGoalBItem = learningSubGoals[indexB];

			const tempPriority = subGoalAItem.priority;
			subGoalAItem.priority = subGoalBItem.priority;
			subGoalBItem.priority = tempPriority;

			inProgress[goalIndex].learningSubGoals.sort((a, b) =>
				a.priority <= b.priority ? -1 : 1
			);

			editSubGoalPriority({ priority: subGoalAItem.priority, subGoalId: subGoalBItem.id });
			editSubGoalPriority({ priority: subGoalBItem.priority, subGoalId: subGoalAItem.id });
		}

		let found;
		// If up identify the goal with the next higher priority and switch priorities.
		if (direction === "up") {
			subGoals.sort((a, b) => (a.priority > b.priority ? -1 : 1));
			found = subGoals.find(goal => {
				return goal.priority <= subGoal.priority - 1;
			});
			if (found) {
				switchGoals(found, subGoal);
			}

			// If down identify the goal with the next lower priority and switch priorities.
		} else if (direction === "down") {
			subGoals.sort((a, b) => (a.priority < b.priority ? -1 : 1));
			found = subGoals.find(goal => {
				return goal.priority >= subGoal.priority + 1;
			});
			if (found) {
				switchGoals(found, subGoal);
			}
		}
	}

	return (
		<CenteredSection className="overflow-y-auto bg-gray-50 pb-32 px-5">
			<section>
				<div className="flex items-center justify-between gap-4">
					<SectionHeader title="Meine Lernziele" />
					<button className="btn-primary -mt-8" onClick={() => setOpenAddDialog(true)}>
						<PlusIcon className="icon h-5" />
						<span>Lernziel hinzufügen</span>
					</button>
				</div>

				<div className="py-2 ">
					<LearningGoalProvider
						userGoals={inProgress}
						onStatusUpdate={onStatusUpdate}
						moveSubGoal={moveSubGoal}
					>
						{selectedTab === 0 && (
							<TabContent
								selectedTab={selectedTab}
								setSelectedTab={setSelectedTab}
								notFoundMessage={"Derzeit ist kein Ziel erstellt worden."}
								editable={true}
								onRowClick={handleEditTarget}
							/>
						)}
					</LearningGoalProvider>
					<LearningGoalProvider
						userGoals={complete}
						onStatusUpdate={onStatusUpdate}
						moveSubGoal={moveSubGoal}
					>
						{selectedTab === 1 && (
							<TabContent
								selectedTab={selectedTab}
								setSelectedTab={setSelectedTab}
								notFoundMessage={"Derzeit ist kein Ziel abgeschlossen."}
								editable={false}
								onRowClick={handleEditTarget}
							/>
						)}
					</LearningGoalProvider>
				</div>
			</section>
			{openAddDialog && <GoalEditorDialog onClose={() => setOpenAddDialog(false)} />}
			{editTarget && (
				<GoalEditorDialog goal={editTarget} onClose={() => setEditTarget(null)} />
			)}
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
	notFoundMessage,
	editable,
	onRowClick
}: Readonly<{
	notFoundMessage: string;
	editable: boolean;
	onRowClick: (editedGoal: Goal) => void;
}>) {
	const { userGoals: goals } = useLearningGoalContext();
	if (goals.length === 0) {
		return <p>Keine Ziele Gefunden.</p>;
	}

	return (
		<div>
			{goals.length > 0 ? (
				<ul className="space-y-4">
					{goals.map(goal => (
						<GoalRow
							onClick={onRowClick}
							key={goal.id}
							editable={editable}
							goal={goal}
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
	notFoundMessage,
	editable,
	onRowClick
}: Readonly<{
	selectedTab: number;
	setSelectedTab: (v: number) => void;
	notFoundMessage: string;
	editable: boolean;
	onRowClick: (editedGoal: Goal) => void;
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
						notFoundMessage={notFoundMessage}
						editable={editable}
						onRowClick={onRowClick}
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
	editable,
	goal,
	onClick
}: Readonly<{
	editable: boolean;
	goal: Goal;
	onClick: (editedGoal: Goal) => void;
}>) {
	const [showTooltip, setShowTooltip] = useState(false);

	useEffect(() => {
		// let timer: Timeout;
		if (goal.status !== "COMPLETED" && goal.learningSubGoals.length > 0) {
			const index = goal.learningSubGoals.findIndex(
				subGoal => subGoal.status === "INACTIVE" || subGoal.status === "ACTIVE"
			);
			if (index < 0) {
				setShowTooltip(true);
				setTimeout(() => {
					setShowTooltip(false);
				}, 5000);
			} else {
				setShowTooltip(false);
			}
		}
	}, [goal]);

	const { onStatusUpdate } = useLearningGoalContext();

	return (
		<section>
			<li className="flex flex-col gap-2 rounded-lg bg-gray-100 p-4">
				<div className="flex w-full flex-row justify-between">
					<div className="group flex flex-row">
						<div className="mb-2 text-xl font-semibold">{goal.description}</div>
						{goal.status !== "COMPLETED" && editable && (
							<div className="invisible flex flex-row group-hover:visible">
								<QuickEditButton onClick={() => onClick(goal)} />
								<GoalDeleteOption
									goalId={goal.id}
									isSubGoal={false}
									className="px-2 hover:text-secondary"
								/>
							</div>
						)}
					</div>
					<div className="relative mr-4 flex justify-end">
						<GoalStatus goal={goal} editable={editable} onChange={onStatusUpdate} />
						{showTooltip && (
							<div className="absolute top-1/10 min-w-[262px] right-7 -top-1 -translate-y-2/3 px-3 py-1 text-sm text-white bg-gray-700 rounded shadow">
								Lernziel kann abgeschlossen werden.
								<br />
								Alle Feinziele erreicht.
							</div>
						)}
					</div>
				</div>
				<ul className="flex flex-col gap-1">
					{goal.learningSubGoals.map(subGoal => (
						<SubGoalRow
							key={subGoal.id}
							subGoal={subGoal}
							editable={editable}
							goal={goal}
						/>
					))}
				</ul>
			</li>
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
	goal
}: Readonly<{
	subGoal: LearningSubGoal;
	editable: boolean;
	goal: Goal;
}>) {
	const [openAddDialog, setOpenAddDialog] = useState(false);
	const { userGoals: goals, onStatusUpdate, moveSubGoal } = useLearningGoalContext();

	const result = goals.filter(goal => {
		return goal.id === subGoal.learningGoalId;
	});
	let max;
	let min;
	if (result.length > 0) {
		max = result[0].learningSubGoals.reduce((a, b) =>
			a.priority > b.priority ? a : b
		).priority;
		min = result[0].learningSubGoals.reduce((a, b) =>
			a.priority < b.priority ? a : b
		).priority;
	}

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
								hidden={subGoal.priority === min || !editable}
							>
								<ArrowUpIcon className="h-3" />
							</button>
							{(subGoal.priority === min || !editable) && <div className="p-2.5" />}
							<button
								type="button"
								title="Nach unten"
								className="rounded p-1 hover:bg-gray-200"
								onClick={() =>
									moveSubGoal(subGoal, "down", result[0].learningSubGoals)
								}
								hidden={subGoal.priority === max || !editable}
							>
								<ArrowDownIcon className="h-3" />
							</button>
							{(subGoal.priority === max || !editable) && <div className="p-2.5" />}
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
							subGoal={subGoal}
							editable={editable}
							onChange={onStatusUpdate}
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

function GoalDeleteOption({
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
		console.error("Could not change goal:", error);
	}
};
