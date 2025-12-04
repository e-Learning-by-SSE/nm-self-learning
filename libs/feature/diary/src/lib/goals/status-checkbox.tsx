import { GoalFormModel, StatusUpdateCallback } from "../util/types";

/**
 * Component to display and change the status of a learning goal or sub-goal. Shows the status and on click opens the three option for a status.
 *
 * @param goal Learning goal data
 * @param subGoal Learning sub-goal data
 * @param editable Indicator if a status can be edited.
 * @returns
 */
export function GoalStatusCheckbox({
	goal,
	editable,
	onChange
}: Readonly<{
	goal: GoalFormModel;
	editable: boolean;
	onChange?: StatusUpdateCallback;
}>) {
	const isSubGoal = !!goal.parentId;

	// Top level goal: Do not allow change after marked as completed
	const goalDisabled = !editable || (goal && !isSubGoal && goal.status === "COMPLETED");
	// Do not allow sub goals to be changed if top level goal is completed
	const subGoalDisabled = !editable || (isSubGoal && goal && goal.status === "COMPLETED");
	const disabled = isSubGoal ? subGoalDisabled : goalDisabled;

	let statusColorSettings: string;
	switch (goal.status) {
		case "ACTIVE":
			statusColorSettings = disabled
				? "disabled:cursor-not-allowed text-c-attention-muted focus:ring-c-attention-muted"
				: "text-c-attention focus:ring-c-attention";
			break;
		case "COMPLETED":
			statusColorSettings = disabled
				? "disabled:cursor-not-allowed text-c-success-muted focus:ring-c-success-muted"
				: "text-c-success focus:ring-c-success";
			break;
		default:
			statusColorSettings = disabled
				? "disabled:cursor-not-allowed focus:ring-c-neutral"
				: "focus:ring-c-neutral";
	}

	const checked = goal.status === "COMPLETED" || goal.status === "ACTIVE";
	return (
		<div className="flex p-1">
			<input
				type="checkbox"
				checked={checked}
				disabled={disabled}
				className={`flex flex-grow aspect-square bg-c-surface-2 border-c-border-strong rounded dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 ${statusColorSettings}`}
				onChange={() => onChange?.(goal)}
				data-testid={`goal_status:${goal.id}`}
			/>
		</div>
	);
}
