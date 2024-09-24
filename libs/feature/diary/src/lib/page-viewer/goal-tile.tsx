import { trpc } from "@self-learning/api-client";
import { Tile } from "@self-learning/diary";
import { Dialog, LoadingCircle } from "@self-learning/ui/common";
import { useState } from "react";
import { LearningGoalType } from "../util/types";
import { GoalsOverview, LearningGoals } from "../goals/learning-goals";
import { LearningGoal } from "@self-learning/types";

export function LearningGoalInputTile({
	initialGoals,
	onChange
}: {
	initialGoals: LearningGoalType[] | undefined;
	onChange: (editedGoal: LearningGoal) => void;
}) {
	const [dialogOpen, setDialogOpen] = useState<boolean>(false);

	const { data: learningGoals, isLoading } = trpc.learningGoal.loadLearningGoal.useQuery();

	const onClose = () => {
		setDialogOpen(false);
	};

	function onSave() {
		onClose();
	}

	// function onEdit(editedGoal: LearningGoalType) {

	// 	onEditGoal([...transformedGoals]);
	// 	const getNewGoals = (prevGoals: LearningGoal[]) => {
	// 		// Check if the goal already exists in the previous goals array
	// 		const goalExists = prevGoals.some(goal => goal.id === editedGoal.id);

	// 		// If the goal does not exist, add it to the array
	// 		if (!goalExists) {
	// 			return onEditGoal([...prevGoals, editedGoal]);
	// 		}

	// 		// If the goal exists, replace it in the array
	// 		return onEditGoal(prevGoals.map(goal => (goal.id === editedGoal.id ? editedGoal : goal)));
	// 	};

	// 	getNewGoals(initialGoals ? transformedGoals : []);
	// }

	// const transformedGoals: LearningGoal[] | undefined = learningGoals?.map(goal => ({
	// 	...goal,
	// 	lastProgressUpdate: goal.lastProgressUpdate
	// 		? new Date(goal.lastProgressUpdate)
	// 		: undefined
	// }));

	function handleEditGoal(goal: LearningGoalType) {
		// transform the LearningGoalType (database) to LearningGoal (frontend validation) here.
		// The types slightly differ as usual. The place where this happens was not chosen explicitly from a design viewpoint.
		// It was just the most convenient place to do so in order to reduce refactor overhead.
		onChange({
			...goal,
			lastProgressUpdate: goal.lastProgressUpdate
				? new Date(goal.lastProgressUpdate)
				: undefined
		});
	}
	if (!learningGoals || isLoading) {
		return <LoadingCircle />;
	}
	return (
		<div>
			<Tile onToggleEdit={setDialogOpen} tileName={"Lernziele"} isFilled={false}>
				<div>
					<GoalsOverview
						goals={learningGoals}
						notFoundMessage={"Es wurden noch keine Lernziele Festgelegt"}
						editable={false}
						onClick={() => setDialogOpen(true)}
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
								<LearningGoals goals={learningGoals} onEdit={handleEditGoal} />
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
