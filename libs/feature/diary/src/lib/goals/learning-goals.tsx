import { PencilIcon } from "@heroicons/react/24/outline";
import { ArrowDownIcon, ArrowUpIcon, TrashIcon } from "@heroicons/react/24/solid";
import { trpc } from "@self-learning/api-client";
import {
	ButtonActions,
	Dialog,
	DialogHandler,
	dispatchDialog,
	freeDialog,
	LoadingBox,
	PlusButton,
	showToast,
	SimpleDialog,
	Tab,
	Tabs
} from "@self-learning/ui/common";
import { IdSet } from "@self-learning/util/common";
import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { convertLearningGoal, GoalFormModel, StatusUpdateCallback } from "../util/types";
import { LearningGoalProvider, useLearningGoalContext } from "./goal-context";
import { CreateGoalDialog, EditGoalDialog } from "./goal-editor";
import { GoalStatusCheckbox } from "./status-checkbox";
import { updateGoalStatus } from "../util/goal-status";

/**
 * Component for displaying learning goals. It contains dialogs for creating and editing of learning goals and sub-goals (Grob-/ Feinziel).
 * For every goal the status is displayed and all sub-goals.
 *
 * @param goals Learning goal data
 * @param onStatusUpdate Function is called when a goal is modified. For changes which needs to be updated when trpc reloads aren't sufficient.
 * @returns A component to display learning goals
 */
export function LearningGoals({
	goals,
	onStatusUpdate
}: {
	goals: IdSet<GoalFormModel>;
	onStatusUpdate?: StatusUpdateCallback;
}) {
	const [selectedTab, setSelectedTab] = useState(0);
	const [editTarget, setEditTarget] = useState<GoalFormModel | null>(null);
	const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
	const [newGoalParent, setNewGoalParent] = useState<GoalFormModel | undefined>(undefined);
	const { mutateAsync: editGoal } = trpc.learningGoal.editGoal.useMutation();

	const inProgress: IdSet<GoalFormModel> = new IdSet([]);
	const complete: IdSet<GoalFormModel> = new IdSet([]);
	const validParents = new IdSet<GoalFormModel>();
	goals.forEach(goal => {
		const isParentGoalComplete =
			(goals.get(goal.parentId ?? "")?.status ?? "COMPLETED") === "COMPLETED";
		if (goal.status === "INACTIVE" || goal.status === "ACTIVE" || !isParentGoalComplete) {
			inProgress.add(goal);
		} else if (goal.status === "COMPLETED") {
			complete.add(goal);
		}
		if (goal.status !== "COMPLETED" && !goal.parentId) {
			validParents.add(goal);
		}
	});

	const handleStatusUpdate: StatusUpdateCallback = goal => {
		updateGoalStatus(goal, goals, editGoal);
		onStatusUpdate?.(goal);
	};

	const handleEditTarget = (editedGoal: GoalFormModel) => {
		setEditTarget(editedGoal);
	};

	const handleCreateGoal = (parent?: GoalFormModel) => {
		console.log(parent);
		setOpenAddDialog(true);
		setNewGoalParent(parent);
	};

	const closeAddDialog = () => {
		setOpenAddDialog(false);
		setNewGoalParent(undefined);
	};

	const closeEditDialog = () => {
		setEditTarget(null);
	};

	const handleEditSubmit = (goal: GoalFormModel) => {
		editGoal(goal);
		closeEditDialog();
	};

	return (
		<>
			<div className="flex items-center justify-end gap-4">
				<button className="btn-primary" onClick={() => setOpenAddDialog(true)}>
					<span>Lernziel erstellen</span>
				</button>
			</div>

			<div className="py-2 ">
				<LearningGoalProvider
					userGoals={inProgress}
					onStatusUpdate={handleStatusUpdate}
					onCreateGoal={handleCreateGoal}
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
					onStatusUpdate={handleStatusUpdate}
					onCreateGoal={handleCreateGoal}
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
			{openAddDialog && (
				<CreateGoalDialog
					onClose={closeAddDialog}
					initialParentGoal={newGoalParent}
					validParents={validParents}
				/>
			)}
			{editTarget && (
				<EditGoalDialog
					goal={editTarget}
					onClose={closeEditDialog}
					onSubmit={handleEditSubmit}
				/>
			)}
			<DialogHandler id={"simpleGoalDialog"} />
		</>
	);
}

export function useLearningGoals() {
	const { data: goals, isLoading } = trpc.learningGoal.loadLearningGoal.useQuery();
	const userGoals = new IdSet(goals?.map(convertLearningGoal) ?? ([] as GoalFormModel[]));
	return { userGoals, isLoading };
}

export function LearningGoalsDialog({
	onClose,
	onStatusUpdate,
	description
}: {
	onClose: () => void;
	onStatusUpdate: StatusUpdateCallback;
	description: string;
}) {
	const { userGoals, isLoading } = useLearningGoals();
	return (
		<Dialog title={description} onClose={onClose}>
			<div className="overflow-y-auto mb-2 px-2" style={{ minWidth: "30vw" }}>
				{isLoading && <LoadingBox />}
				{userGoals && <LearningGoals goals={userGoals} onStatusUpdate={onStatusUpdate} />}
			</div>
			<div className="flex justify-end">
				<button type="button" className="btn-primary" onClick={onClose}>
					Schließen
				</button>
			</div>
		</Dialog>
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
	onRowClick: (editedGoal: GoalFormModel) => void;
}>) {
	const { userGoals: goals } = useLearningGoalContext();
	const parentGoals = goals.values().filter(goal => !goal.parentId);
	return (
		<div>
			{goals.size > 0 ? (
				<ul className="space-y-4">
					{parentGoals.map(goal => (
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
	onRowClick: (editedGoal: GoalFormModel) => void;
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
	goal: GoalFormModel;
	onClick: (editedGoal: GoalFormModel) => void;
}>) {
	const [statusUpdateTriggered, setStatusUpdateTriggered] = useState(false); // NEW
	const { t } = useTranslation("common");
	const { userGoals } = useLearningGoalContext();

	useEffect(() => {
		if (statusUpdateTriggered && goal.status !== "COMPLETED" && goal.children.length > 0) {
			// Check if any child goal is still "INACTIVE" or "ACTIVE"
			const hasActiveOrInactiveSubGoals = goal.children.some(childId => {
				const childGoal = userGoals.get(childId); // Use the goals map to find the child goal
				return childGoal?.status === "INACTIVE" || childGoal?.status === "ACTIVE";
			});

			if (!hasActiveOrInactiveSubGoals) {
				showToast({
					type: "info",
					title: `Lernziel "${goal.description}" kann abgeschlossen werden.`,
					subtitle: "Alle Feinziele erreicht."
				});
				setStatusUpdateTriggered(false);
			}
		}
	}, [goal, userGoals, statusUpdateTriggered]);

	const { onStatusUpdate, onCreateGoal } = useLearningGoalContext();

	const handleStatusUpdate = useCallback(
		(updatedGoal: GoalFormModel) => {
			setStatusUpdateTriggered(true);
			onStatusUpdate?.(updatedGoal);
		},
		[onStatusUpdate, setStatusUpdateTriggered]
	);

	const { mutateAsync: editGoal } = trpc.learningGoal.editGoal.useMutation();
	const moveUp = (order: number) => {
		if ((order ?? 0) > 0) {
			const goal1 = userGoals.get(goal.children[order] ?? "");
			const goal2 = userGoals.get(goal.children[order - 1] ?? "");
			moveSubGoal(goal1, goal2);
		}
	};

	const moveDown = (order: number) => {
		if ((order ?? Number.MAX_SAFE_INTEGER) < goal.children.length - 1) {
			const goal1 = userGoals.get(goal.children[order] ?? "");
			const goal2 = userGoals.get(goal.children[order + 1] ?? "");
			moveSubGoal(goal1, goal2);
		}
	};

	async function moveSubGoal(target?: GoalFormModel, toMove?: GoalFormModel) {
		if (!target || !toMove) {
			console.log("Warning: trying to swap nonexisting goals!");
			return;
		}
		if (toMove?.order ?? 0 < target.order ?? 0) {
			// TODO what if one of these fails?
			await editGoal({ order: toMove.order, id: target.id });
			await editGoal({ order: target.order, id: toMove.id });
		} else {
			await editGoal({ order: toMove.order, id: target.id });
			await editGoal({ order: target.order, id: toMove.id });
		}
	}

	return (
		<section>
			<li className="flex flex-col gap-2 rounded-lg bg-gray-100 p-4">
				<div className="group flex flex-row flex-grow justify-between mb-2">
					<div className="flex">
						<div className="relative mr-4 flex">
							<GoalStatusCheckbox
								goal={goal}
								editable={editable}
								onChange={onStatusUpdate}
							/>
						</div>
						<div className="text-xl font-semibold w justify-end">
							{goal.description}
						</div>
					</div>
					{goal.status !== "COMPLETED" && editable && (
						<div className="flex">
							<div className="flex flex-row">
								<QuickEditButton onClick={() => onClick(goal)} />
								<GoalDeleteOption
									goalId={goal.id}
									className="px-2 hover:text-secondary"
								/>
							</div>
							<PlusButton
								title={t("create")}
								onClick={() => onCreateGoal?.(goal)}
								size="small"
								additionalClassNames="w-14 text-center flex justify-center"
							/>
						</div>
					)}
				</div>
				<ul className="flex flex-col gap-1">
					{goal.children.map((childId, index) => (
						<SubGoalRow
							onClick={onClick}
							onStatusChange={handleStatusUpdate}
							key={childId}
							editable={editable}
							goalId={childId}
							moveUp={
								index !== 0
									? () => {
											moveUp(index);
										}
									: undefined
							}
							moveDown={
								index !== goal.children.length - 1
									? () => {
											moveDown(index);
										}
									: undefined
							}
						/>
					))}
				</ul>
			</li>
		</section>
	);
}

/**
 * Component to display a row for a learning sub-goal. Contains a dialog for editing sub-goals. Buttons to change the order (up or down).
 *
 * @param subGoal Learning sub-goal data for the row
 * @param goals Learning goals data
 * @param editable Shows whether a goal can be edited
 * @returns
 */
function SubGoalRow({
	editable,
	goalId,
	moveUp,
	moveDown,
	onClick,
	onStatusChange
}: Readonly<{
	editable: boolean;
	goalId: string;
	moveUp?: () => void;
	moveDown?: () => void;
	onClick: (editedGoal: GoalFormModel) => void;
	onStatusChange?: (goalToChange: GoalFormModel) => void;
}>) {
	const { userGoals } = useLearningGoalContext();
	const goal = userGoals.get(goalId);
	if (!goal) {
		console.error("Fatal error, goal not found in client memory");
		return null;
	}

	return (
		<span className="flex w-full justify-between gap-4 rounded-lg bg-white px-4 py-2">
			<div className="group flex flex-row flex-grow justify-between">
				<div className="flex">
					<div className="flex mr-2">
						<GoalStatusCheckbox
							goal={goal}
							editable={editable}
							onChange={onStatusChange}
						/>
					</div>
					<span>{goal.description}</span>
				</div>
				<div className="flex">
					{editable && (
						<div className="flex">
							<QuickEditButton onClick={() => onClick(goal)} />
							<GoalDeleteOption
								goalId={goal.id}
								className="px-2 hover:text-secondary"
							/>
						</div>
					)}
					<button
						type="button"
						title="Priorität erhöhen"
						className="rounded p-1 hover:bg-gray-200"
						onClick={moveUp}
						hidden={!moveUp || !editable}
					>
						<ArrowUpIcon className="h-3" />
					</button>
					{(!moveUp || !editable) && <div className="p-2.5" />}
					<button
						type="button"
						title="Priorität senken"
						className="rounded p-1 hover:bg-gray-200"
						onClick={moveDown}
						hidden={!moveDown || !editable}
					>
						<ArrowDownIcon className="h-3" />
					</button>
					{(!moveDown || !editable) && <div className="p-2.5" />}
				</div>
			</div>
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
	onDeleteSuccess
}: Readonly<{
	goalId: string;
	className?: string;
	onDeleteSuccess?: () => void | PromiseLike<void>;
}>) {
	const { mutateAsync: deleteGoal } = trpc.learningGoal.deleteGoal.useMutation();
	const onClose = async () => {
		await withErrorHandling(async () => {
			await deleteGoal({ goalId });
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
