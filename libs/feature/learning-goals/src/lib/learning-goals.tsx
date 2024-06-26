import { LearningGoalType } from "@self-learning/api";
import { useState } from "react";
import {
	ButtonActions,
	DialogHandler,
	Divider,
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
import { PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/solid";
import { trpc } from "@self-learning/api-client";
import { GoalEditorDialog } from "./learning-goal-components/learning-goal-editor-dialog";
import { GoalStatus } from "./learning-goal-components/status";

export default LearningGoals;

export function LearningGoals({ goals }: Readonly<{ goals: LearningGoal[] | null }>) {
	const [selectedTab, setSelectedTab] = useState(0);
	const [openAddDialog, setOpenAddDialog] = useState(false);

	if (!goals) {
		return <p>No goals found</p>;
	}

	const inProgress = goals.filter(
		goals => goals.status == "INACTIVE" || goals.status == "ACTIVE"
	);
	const complete = goals.filter(goals => goals.status == "COMPLETED");

	return (
		<CenteredSection className="bg-gray-50 pb-32">
			<section>
				<div className="flex items-center justify-between gap-4">
					<SectionHeader title="Lernziele" />
					<button className="btn-primary" onClick={() => setOpenAddDialog(true)}>
						<PlusIcon className="icon h-5" />
						<span>Lernziel hinzufügen</span>
					</button>
				</div>

				<div className="py-2 px-4">
					{selectedTab === 0 && (
						<TabContent
							selectedTab={selectedTab}
							setSelectedTab={setSelectedTab}
							goals={inProgress}
							notFoundMessage={"Derzeit ist kein Ziel erstellt worden."}
							editable={true}
						/>
					)}
					{selectedTab === 1 && (
						<TabContent
							selectedTab={selectedTab}
							setSelectedTab={setSelectedTab}
							goals={complete}
							notFoundMessage={"Derzeit ist kein Ziel abgeschlossen."}
							editable={false}
						/>
					)}
				</div>
			</section>
			{openAddDialog && <GoalEditorDialog onClose={() => setOpenAddDialog(false)} />}
			<DialogHandler id={"simpleGoalDialog"} />
		</CenteredSection>
	);
}

function GoalsOverview({
	goals,
	notFoundMessage,
	editable
}: Readonly<{
	goals: LearningGoalType | null;
	notFoundMessage: string;
	editable: boolean;
}>) {
	if (!goals) {
		return <p>Keine Ziele Gefunden.</p>;
	}

	return (
		<div>
			{goals.length > 0 ? (
				<ul className="space-y-4">
					{goals.map(goal => (
						<GoalTable key={goal.id} goal={goal} editable={editable} />
					))}
				</ul>
			) : (
				<p className="text-center">{notFoundMessage}</p>
			)}
		</div>
	);
}

function TabContent({
	selectedTab,
	setSelectedTab,
	goals,
	notFoundMessage,
	editable
}: Readonly<{
	selectedTab: number;
	setSelectedTab: (v: number) => void;
	goals: LearningGoalType | null;
	notFoundMessage: string;
	editable: boolean;
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
					/>
				</div>
			</div>
		</div>
	);
}

function GoalTable({
	goal,
	editable
}: Readonly<{
	goal: LearningGoal;
	editable: boolean;
}>) {
	const [openAddDialog, setOpenAddDialog] = useState(false);

	if (goal && goal.status != "COMPLETED") {
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
		<li
			key={goal.id}
			//flex flex-col space-y-2 rounded-lg bg-white p-4 shadow-md md:flex-row md:space-y-0 md:space-x-4
			className="flex flex-col space-y-2   p-4  md:flex-row md:space-y-0 md:space-x-4"
		>
			<div className="flex flex-grow flex-col space-y-1">
				<table className="w-full">
					<tbody>
						<tr>
							<td className="w-3/5">
								<div className="group flex flex-row">
									<div className="font-bold">{goal.description}</div>
									{goal.status != "COMPLETED" && editable && (
										<div className="invisible group-hover:visible">
											<QuickEditButton
												onClick={() => setOpenAddDialog(true)}
											/>
											<GoalDeleteOption
												goalId={goal.id}
												isSubGoal={false}
												className="px-2 hover:text-secondary"
											/>
										</div>
									)}
								</div>
							</td>
							<td className="w-2/5">
								<div className="flex justify-end">
									<GoalStatus goal={goal} editable={editable} />
								</div>
							</td>
						</tr>
						{goal.learningSubGoals.map(subGoal => (
							<SubGoalRow key={subGoal.id} subGoal={subGoal} editable={editable} />
						))}
					</tbody>
				</table>
				{openAddDialog && (
					<GoalEditorDialog goal={goal} onClose={() => setOpenAddDialog(false)} />
				)}
				<Divider />
			</div>
		</li>
	);
}

function SubGoalRow({
	subGoal,
	editable
}: Readonly<{
	subGoal: LearningSubGoal;
	editable: boolean;
}>) {
	const [openAddDialog, setOpenAddDialog] = useState(false);
	return (
		<tr key={subGoal.id}>
			<td className="w-3/5">
				<div className="group flex flex-row">
					<div className="ml-5">{subGoal.description}</div>
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
					{openAddDialog && (
						<GoalEditorDialog
							subGoal={subGoal}
							onClose={() => setOpenAddDialog(false)}
						/>
					)}
				</div>
			</td>
			<td className="w-2/5">
				<div className="flex justify-end">
					<GoalStatus subGoal={subGoal} editable={editable} />
				</div>
			</td>
		</tr>
	);
}

function QuickEditButton({ onClick }: Readonly<{ onClick: () => void }>) {
	return (
		<button title="Bearbeiten" className="mr-3 px-2 hover:text-secondary" onClick={onClick}>
			<PencilIcon className="ml-1 h-5 text-lg" />
		</button>
	);
}

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
				Soll das Ziel wirklich gelöscht werden?
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
