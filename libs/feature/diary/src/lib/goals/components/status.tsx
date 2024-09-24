import { LockClosedIcon, LockOpenIcon } from "@heroicons/react/24/solid";
import { LearningGoalStatus } from "@prisma/client";
import { trpc } from "@self-learning/api-client";
import {  LearningSubGoal } from "@self-learning/types";
import { useEffect, useRef, useState } from "react";
import { LearningGoalType } from "../../util/types";

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
	onEdit
}: Readonly<{
	goal?: LearningGoalType;
	subGoal?: LearningSubGoal;
	editable: boolean;
	onEdit: (editedGoal: LearningGoalType) => void;
}>) {
	const { mutateAsync: editSubGoal } = trpc.learningGoal.editSubGoalStatus.useMutation();
	const { mutateAsync: editGoal } = trpc.learningGoal.editGoalStatus.useMutation();
	const [showDialog, setShowDialog] = useState(false);
	const [status, setStatus] = useState(
		goal?.status ?? subGoal?.status ?? LearningGoalStatus.INACTIVE
	);
	const [initialRender, setInitialRender] = useState(true);

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
	 * Hook for changing the status of a goal or sub-goal.
	 */
	useEffect(() => {
		if (initialRender) {
			setInitialRender(false);
		} else {
			const date = new Date();
			const lastProgressUpdate = date.toISOString();
			if (!subGoal && goal) {
				editGoal({ goalId: goal.id, lastProgressUpdate, status });
				onEdit({
					...goal,
					status: status
				});
			} else if (subGoal && goal) {
				editSubGoal({
					subGoalId: subGoal.id,
					status,
					learningGoalId: subGoal.learningGoalId,
					lastProgressUpdate
				});
				onEdit({
					...goal,
					status: status
				});
			}
		}
	}, [status]);

	/**
	 * Function on change of a goal or sub-goal status. Close the three options
	 *
	 * @param pStatus Selected new status value
	 */
	function onChange(pStatus: LearningGoalStatus) {
		setStatus(pStatus);
		setShowDialog(false);
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
				{disable && <LockClosedIcon className="ml-3 h-4" />}
				{!disable && goal && <LockOpenIcon className="ml-3 h-4" />}
			</button>
			{showDialog && (
				<div className="absolute z-50 flex flex-row" ref={myRef}>
					<button
						className="h-5 w-10 rounded-md border-gray-400 bg-red-300"
						onClick={() => onChange("INACTIVE")}
						title="Nicht bearbeitet"
					/>
					<button
						className="h-5 w-10 rounded-md border-gray-400 bg-orange-300"
						onClick={() => onChange("ACTIVE")}
						title="Teilweise bearbeitet"
					/>
					<button
						className="h-5 w-10 rounded-md border-gray-400 bg-green-300"
						onClick={() => onChange("COMPLETED")}
						title="Bearbeitet"
					/>
				</div>
			)}
		</div>
	);
}
