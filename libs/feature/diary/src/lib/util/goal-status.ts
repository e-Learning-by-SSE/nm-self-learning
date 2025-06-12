import { LearningGoalStatus } from "@prisma/client";
import { GoalFormModel } from "./types";
import { inferProcedureInput } from "@trpc/server";
import { AppRouter } from "@self-learning/api";
import { IdSet, isTruthy } from "@self-learning/util/common";

function cycleStatus(current: LearningGoalStatus): LearningGoalStatus {
	switch (current) {
		case "ACTIVE":
			return "COMPLETED";
		case "COMPLETED":
			return "INACTIVE";
		default:
			return "ACTIVE";
	}
}

// Set new status based on current status and use newStatus to update goal
// If top-level goal, allow COMPLETION only if all sub-goals are completed
// If sub-goal, allow changing status only if parent goal is NOT completed
function cycleGoalStatus(current: GoalFormModel, children: GoalFormModel[]): GoalFormModel {
	const newStatus = cycleStatus(current.status);
	const isParent = !current.parentId;

	if (isParent && newStatus === "COMPLETED") {
		const areSubGoalsCompleted = children.filter(cg => cg.status !== "COMPLETED").length === 0;
		if (areSubGoalsCompleted) {
			return {
				...current,
				status: newStatus
			};
		} else {
			// Skip COMPLETED status if not all sub-goals are completed
			return {
				...current,
				status: "ACTIVE"
			};
		}
	}
	return {
		...current,
		status: newStatus
	};
}

// extracted for better testability
type EditGoalInput = inferProcedureInput<AppRouter["learningGoal"]["editGoal"]>;
export function updateGoalStatus(
	goal: GoalFormModel,
	goals: IdSet<GoalFormModel>,
	editGoal: (updatedGoal: EditGoalInput) => void
): void {
	// Handle status cycle
	const subGoals = goal.children.map(cid => goals.get(cid)).filter(isTruthy);
	const newStatus = cycleGoalStatus(goal, subGoals);

	if (newStatus.status !== goal.status) {
		editGoal(newStatus);
	}

	// If the goal is a sub-goal, check if the parent goal should be activated
	const parent = goals.get(goal.parentId ?? "");
	if (parent && parent.status === "INACTIVE") {
		editGoal({
			id: parent.id,
			status: "ACTIVE",
			lastProgressUpdate: new Date()
		});
	}
}
