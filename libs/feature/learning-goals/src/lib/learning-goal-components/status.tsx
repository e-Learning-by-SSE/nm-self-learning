import { LearningGoalStatus } from "@prisma/client";
import { trpc } from "@self-learning/api-client";
import { LearningGoal, LearningSubGoal } from "@self-learning/types";
import { showToast } from "@self-learning/ui/common";
import { useEffect, useRef, useState } from "react";

export function GoalStatus({
	goal,
	subGoal
}: Readonly<{
	goal?: LearningGoal;
	subGoal?: LearningSubGoal;
}>) {
	const { mutateAsync: editSubGoal } = trpc.learningGoal.editSubGoalStatus.useMutation();
	const { mutateAsync: editGoal } = trpc.learningGoal.editGoalStatus.useMutation();
	const [showDialog, setShowDialog] = useState(false);
	const [status, setStatus] = useState(
		goal?.status ?? subGoal?.status ?? LearningGoalStatus.INACTIVE
	);
	const [initialRender, setInitialRender] = useState(true);

	const myRef = useRef<HTMLInputElement>(null);

	const handleClickOutside = (e: { target: any }) => {
		if (myRef.current && !myRef.current.contains(e.target)) {
			setShowDialog(false);
		}
	};

	const handleClickInside = () => setShowDialog(true);

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

	useEffect(() => {
		if (initialRender) {
			setInitialRender(false);
		} else {
			const date = new Date();
			const lastProgressUpdate = date.toISOString();
			if (goal) {
				editGoal({ goalId: goal.id, lastProgressUpdate, status });
			} else if (subGoal) {
				editSubGoal({
					subGoalId: subGoal.id,
					status,
					learningGoalId: subGoal.learningGoalId,
					lastProgressUpdate
				});
			}
		}
	}, [status]);

	function onChange(pStatus: LearningGoalStatus) {
		setStatus(pStatus);
		setShowDialog(false);
	}

	function areSubGoalsCompleted() {
		let result = false;
		if (goal) {
			const index = goal.learningSubGoals.findIndex(
				goal => goal.status == "INACTIVE" || goal.status == "ACTIVE"
			);
			if (index < 0) {
				result = true;
			}
		}
		return result;
	}

	return (
		<div className="flex flex-col items-center">
			<button
				className={newClassName}
				onClick={handleClickInside}
				disabled={(goal && status == "COMPLETED") || (goal && !areSubGoalsCompleted())}
			/>
			{showDialog && (
				<div className="fixed z-50" ref={myRef}>
					<button
						className="h-5 w-10 rounded-md border-gray-400 bg-red-300"
						onClick={() => onChange("INACTIVE")}
					/>
					<button
						className="h-5 w-10 rounded-md border-gray-400 bg-orange-300"
						onClick={() => onChange("ACTIVE")}
					/>
					<button
						className="h-5 w-10 rounded-md border-gray-400 bg-green-300"
						onClick={() => onChange("COMPLETED")}
					/>
				</div>
			)}
		</div>
	);
}
