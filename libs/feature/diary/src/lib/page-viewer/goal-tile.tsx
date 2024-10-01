import { trpc } from "@self-learning/api-client";
import { Tile } from "@self-learning/diary";
import { Dialog, LoadingCircle } from "@self-learning/ui/common";
import { useCallback, useState } from "react";
import { LearningGoals } from "../goals/learning-goals";
import { LearningGoal } from "@self-learning/types";
import { StatusUpdateCallback } from "../util/types";
import { GoalStatus } from "../goals/status";
import { IdSet } from "@self-learning/util/common";

export function LearningGoalInputTile({
	goals: displayGoals,
	onChange
}: {
	goals: LearningGoal[];
	onChange: (goal: LearningGoal[]) => void;
}) {
	const [dialogOpen, setDialogOpen] = useState<boolean>(false);

	const onClose = () => {
		setDialogOpen(false);
	};

	const handleGoalStatusUpdate: StatusUpdateCallback = useCallback(
		(goal, _) => {
			// this is handled by form.field.onChange. so push all learning goals with the appended changed one.
			const a = new IdSet(displayGoals);
			a.add(goal as LearningGoal); // TODO goals: make this type safe
			onChange(Array.from(a));
		},
		[displayGoals, onChange]
	);

	return (
		<div>
			<Tile
				onToggleEdit={setDialogOpen}
				tileName={"Lernziele"}
				isFilled={displayGoals.length > 0}
			>
				<div>
					<div className="flex flex-wrap">
						{displayGoals.length === 0 && <span>Keine Lernziele vorhanden</span>}
						{displayGoals.map(goal => (
							<div
								key={goal.id}
								className="flex items-center p-2 border border-gray-300 rounded bg-gray-50 m-2"
							>
								<GoalStatus goal={goal} editable={false} />
								<span className="ml-2">{goal.description}</span>
							</div>
						))}
					</div>
				</div>
			</Tile>
			{dialogOpen && (
				<LearningGoalEditorDialog
					onClose={onClose}
					onStatusUpdate={handleGoalStatusUpdate}
				/>
			)}
		</div>
	);
}

function LearningGoalEditorDialog({
	onClose,
	onStatusUpdate
}: {
	onClose: () => void;
	onStatusUpdate: StatusUpdateCallback;
}) {
	const { data: learningGoals, isLoading } = trpc.learningGoal.loadLearningGoal.useQuery();

	if (!learningGoals || isLoading) {
		return <LoadingCircle />;
	}
	return (
		<Dialog title="Lernziel Editor" onClose={onClose}>
			<div className={"overflow-y-auto"}>
				<div className={"space-y-4"}>
					<div className={"max-w-md py-2"}>
						<span>{"Hier muss noch ein Text rein!!!!!!!!!!!!!!!"}</span>
					</div>
				</div>
				<div className={"flex justify-center py-4"}>
					<LearningGoals goals={learningGoals} onStatusUpdate={onStatusUpdate} />
				</div>
				<div className="flex justify-end">
					<button type="button" className="btn-primary" onClick={onClose}>
						Schließen
					</button>
				</div>
			</div>
		</Dialog>
	);
}
