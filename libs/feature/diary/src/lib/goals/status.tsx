import { ArrowDownRightIcon, ArrowPathIcon, XMarkIcon, CheckIcon } from "@heroicons/react/24/solid";

import { LearningGoalStatus } from "@prisma/client";
import { trpc } from "@self-learning/api-client";
import { LearningSubGoal } from "@self-learning/types";
import { useEffect, useRef, useState } from "react";
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
	const [showDialog, setShowDialog] = useState(false);

	// Be safe and use a state to trigger rerender when user changes something.
	// We could assume that executing "onEdit" will lead to a rerender (e.g. because the "goal" prop changes), but this is not guaranteed.
	// Drawback is double render when the user changes the status.
	const [status, setStatus] = useState(
		subGoal?.status ?? goal.status ?? LearningGoalStatus.INACTIVE
	);

	const myRef = useRef<HTMLInputElement>(null);
	// Handling clicks outside of the three status options and close the option area.
	const handleClickOutside = (e: { target: any }) => {
		if (myRef.current && !myRef.current.contains(e.target)) {
			setShowDialog(false);
		}
	};

	const handleClickInside = () => setShowDialog(true);
	// Hook that managed the mousedown eventListener for handling clicks outside of the status options.
	useEffect(() => {
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	});

	let newClassName = "h-5 w-10 rounded-md border-gray-400";
	// let newClassName = "w-6 h-6 rounded-full";
	switch (status) {
		case "ACTIVE":
			newClassName += " bg-orange-300";
			break;
		case "COMPLETED":
			newClassName += " bg-green-300";
			break;
		case "INACTIVE":
			newClassName += " bg-red-300";
	}

	/**
	 * Function on change of a goal or sub-goal status. Close the three options
	 *
	 * @param pStatus Selected new status value
	 */
	function onChange(pStatus: LearningGoalStatus) {
		setStatus(pStatus);
		setShowDialog(false);
		if (!subGoal && goal) {
			editGoal({ goalId: goal.id, status: pStatus });
		} else if (subGoal && goal) {
			editSubGoal({
				subGoalId: subGoal.id,
				status: pStatus,
				learningGoalId: subGoal.learningGoalId
			});
		}
		onStatusUpdate && onStatusUpdate(goal, pStatus);
	}

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

	const disable =
		(goal && status === "COMPLETED") ||
		(goal && !areSubGoalsCompleted() && !subGoal) ||
		!editable;

	/*
		console.log(goal?.id, goal && !areSubGoalsCompleted());
	*/

	return (
		<div className="relative flex flex-col items-center">
			<button
				className={newClassName}
				onClick={handleClickInside}
				disabled={disable}
				title={
					disable ? "Feinziele müssen Bearbeitet sein" : "Bearbeitungsstatus bearbeiten"
				}
			>
				<ProgressStatusIcon status={status} iconPosition="h-4 ml-3" />
			</button>
			{showDialog && (
				<div className="absolute z-50 flex flex-row" ref={myRef}>
					<button
						className="h-5 w-10 rounded-md border-gray-400 bg-red-300"
						onClick={() => onChange("INACTIVE")}
						title="Nicht bearbeitet"
					>
						<ProgressStatusIcon status="INACTIVE" iconPosition="h-4 ml-3" />
					</button>
					<button
						className="h-5 w-10 rounded-md border-gray-400 bg-orange-300"
						onClick={() => onChange("ACTIVE")}
						title="Teilweise bearbeitet"
					>
						<ProgressStatusIcon status="ACTIVE" iconPosition="h-4 ml-3" />
					</button>
					<button
						className="h-5 w-10 rounded-md border-gray-400 bg-green-300"
						onClick={() => onChange("COMPLETED")}
						title="Bearbeitet"
					>
						<ProgressStatusIcon status="COMPLETED" iconPosition="h-4 ml-3" />
					</button>
				</div>
			)}
		</div>
	);
}

function ProgressStatusIcon({
	status,
	iconPosition
}: {
	status: LearningGoalStatus;
	iconPosition: string;
}) {
	let icon = null;
	const className = iconPosition;
	switch (status) {
		case "INACTIVE":
			icon = <XMarkIcon className={className} />;
			break;
		case "ACTIVE":
			icon = <ArrowPathIcon className={className} />;
			break;
		case "COMPLETED":
			icon = <CheckIcon className={className} />;
			break;
		default:
			icon = <ArrowDownRightIcon className={className} />;
	}
	return icon;
}
