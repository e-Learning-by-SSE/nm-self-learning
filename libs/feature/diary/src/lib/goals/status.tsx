import { LearningGoalStatus } from "@prisma/client";
import { trpc } from "@self-learning/api-client";
import { LearningSubGoal } from "@self-learning/types";
import { Goal, StatusUpdateCallback } from "../util/types";

/**
 * Component to display and change the status of a learning goal or sub-goal. Shows the status and on click opens the three option for a status.
 *
 * @param goal Learning goal data
 * @param subGoal Learning sub-goal data
 * @param editable Indicator if a status can be edited.
 * @returns
 */
export function GoalStatus({
	goal,
	subGoal,
	editable,
	onChange: onStatusUpdate
}: Readonly<{
	goal: Goal;
	subGoal?: LearningSubGoal;
	editable: boolean;
	onChange?: StatusUpdateCallback;
}>) {
	const { mutateAsync: editSubGoal } = trpc.learningGoal.editSubGoalStatus.useMutation();
	const { mutateAsync: editGoal } = trpc.learningGoal.editGoalStatus.useMutation();
	const status = subGoal?.status ?? goal.status ?? LearningGoalStatus.INACTIVE;

	/**
	 * Checks if all sub-goals of a learning goal are completed.
	 *
	 * @returns true every sub-goal completed, false sub-goal with status inactive or active
	 */
	function areSubGoalsCompleted() {
		let result = false;
		if (goal) {
			const index = goal.learningSubGoals.findIndex(
				goal => goal.status === "INACTIVE" || goal.status === "ACTIVE"
			);
			if (index < 0) {
				result = true;
			}
		}
		return result;
	}

	/**
	 * Function on change of a goal or sub-goal status. Close the three options
	 *
	 */
	const onClickStatus = () => {
		// If top-level goal, allow COMPLETION only if all sub-goals are completed
		// If sub-goal, allow changing status only if parent goal is NOT completed
		if ((editable && !subGoal) || (editable && subGoal && goal.status !== "COMPLETED")) {
			// Set new status based on current status and use newStatus to update goal
			const newStatus = (() => {
				switch (status) {
					case "INACTIVE":
						return "ACTIVE";
					case "ACTIVE":
						if (goal && !subGoal && !areSubGoalsCompleted()) {
							return "INACTIVE";
						} else {
							return "COMPLETED";
						}
					default:
						return "INACTIVE";
				}
			})();

			if (newStatus !== status) {
				if (!subGoal && goal) {
					editGoal({ goalId: goal.id, status: newStatus });
				} else if (subGoal && goal) {
					editSubGoal({
						subGoalId: subGoal.id,
						status: newStatus,
						learningGoalId: subGoal.learningGoalId
					});
				}
				onStatusUpdate && onStatusUpdate(goal, newStatus);
			}
		}
	};

	// Top level goal: Do not allow change after marked as completed
	const goalDisabled = !editable || (goal && !subGoal && goal.status === "COMPLETED");
	// Do not allow sub goals to be changed if top level goal is completed
	const subGoalDisabled = !editable || (subGoal && goal && goal.status === "COMPLETED");
	const disabled = subGoal ? subGoalDisabled : goalDisabled;

	return (
		<div className="relative flex flex-col items-center">
			<div className="relative inline-block">
				<TristateButton
					status={status}
					onChange={onClickStatus}
					disabled={disabled}
					goalId={subGoal ? subGoal.id : goal.id}
				/>
			</div>
		</div>
	);
}

function TristateButton({
	status,
	onChange,
	disabled,
	goalId
}: {
	status: LearningGoalStatus;
	onChange: () => void;
	goalId: string;
	disabled?: boolean;
}) {
	let statusColorSettings: string;
	switch (status) {
		case "ACTIVE":
			statusColorSettings = disabled
				? "disabled:cursor-not-allowed text-orange-200 focus:ring-orange-100 dark:focus:ring-orange-200"
				: "text-orange-400 focus:ring-orange-300 dark:focus:ring-orange-400";
			break;
		case "COMPLETED":
			statusColorSettings = disabled
				? "disabled:cursor-not-allowed text-green-200 focus:ring-green-100 dark:focus:ring-green-200"
				: "text-green-400 focus:ring-green-300 dark:focus:ring-green-400";
			break;
		default:
			statusColorSettings = disabled
				? "disabled:cursor-not-allowed focus:ring-red-400 dark:focus:ring-red-400"
				: "focus:ring-red-400 dark:focus:ring-red-400";
	}

	const checked = status === "COMPLETED" || status === "ACTIVE";

	return (
		<div className="flex items-center me-4">
			<input
				type="checkbox"
				checked={checked}
				disabled={disabled}
				className={`w-4 h-4 bg-gray-100 border-gray-300 rounded dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 ${statusColorSettings}`}
				onChange={onChange}
				data-testid={`goal_status:${goalId}`}
			/>
		</div>
	);
}
