import { Tile } from "@self-learning/diary";
import React, { useEffect, useState } from "react";
import { GoalsOverview, LearningGoals } from "@self-learning/learning-goals";
import { LearningGoal } from "@self-learning/types";
import { Dialog, LoadingCircle } from "@self-learning/ui/common";
import { trpc } from "@self-learning/api-client";

export function LearningGoalInputTile({
	initialGoals,
	onChange
}: {
	initialGoals: LearningGoal[] | undefined;
	onChange: (editedGoal: LearningGoal[]) => void;
}) {
	const [dialogOpen, setDialogOpen] = useState<boolean>(false);

	const { data: learningGoals, isLoading } = trpc.learningGoal.loadLearningGoal.useQuery();

	const g: LearningGoal[] | undefined = learningGoals?.map(goal => ({
		...goal,
		lastProgressUpdate: goal.lastProgressUpdate ? new Date(goal.lastProgressUpdate) : null
	}));
	const onClose = () => {
		setDialogOpen(false);
	};

	function onSave() {
		onClose();
	}

	function onEdit(editedGoal: LearningGoal) {
		const getNewGoals = (prevGoals: LearningGoal[]) => {
			// Check if the goal already exists in the previous goals array
			const goalExists = prevGoals.some(goal => goal.id === editedGoal.id);

			// If the goal does not exist, add it to the array
			if (!goalExists) {
				return onChange([...prevGoals, editedGoal]);
			}

			// If the goal exists, replace it in the array
			return onChange(prevGoals.map(goal => (goal.id === editedGoal.id ? editedGoal : goal)));
		};

		getNewGoals(initialGoals ? initialGoals : []);
	}

	useEffect(() => {}, [initialGoals]);

	return (
		<div>
			<Tile onToggleEdit={setDialogOpen} tileName={"Lernziele"} isFilled={false}>
				<div>
					<GoalsOverview
						goals={initialGoals}
						notFoundMessage={"Es wurden noch keine Lernziele Festgelegt"}
						editable={false}
						onEdit={() => {}}
					/>
				</div>
			</Tile>
			{dialogOpen && isLoading ? (
				<Dialog title="Lernziel Editor" onClose={onClose}>
					<div className="flex h-screen bg-gray-50">
						<div className="m-auto">
							<LoadingCircle />
						</div>
					</div>
				</Dialog>
			) : (
				dialogOpen && (
					<Dialog title="Lernziel Editor" onClose={onClose}>
						<div className={"overflow-y-auto"}>
							<div className={"space-y-4"}>
								<div className={"max-w-md py-2"}>
									<span>{"Hier muss noch ein Text rein!!!!!!!!!!!!!!!"}</span>
								</div>
							</div>
							<div className={"flex justify-center py-4"}>
								<LearningGoals goals={g ?? []} onEdit={onEdit} />
							</div>
							<div className="mt-4 flex justify-end space-x-4">
								<button onClick={onClose} className="btn-stroked hover:bg-gray-100">
									Abbrechen
								</button>
								<button onClick={onSave} className="btn-primary" disabled={false}>
									Speichern
								</button>
							</div>
						</div>
					</Dialog>
				)
			)}
		</div>
	);
}
