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

	const checked = goal.status === "COMPLETED" || goal.status === "ACTIVE";
	return (
		<div className="flex p-1">
			<input
				type="checkbox"
				checked={checked}
				disabled={disabled}
				className={`flex flex-grow aspect-square bg-gray-100 border-gray-300 rounded dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 ${statusColorSettings}`}
				onChange={() => onChange?.(goal)}
				data-testid={`goal_status:${goal.id}`}
			/>
		</div>
	);
}
