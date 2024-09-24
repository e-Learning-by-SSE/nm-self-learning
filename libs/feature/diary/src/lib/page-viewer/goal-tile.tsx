import { trpc } from "@self-learning/api-client";
import { Tile } from "@self-learning/diary";
import { Dialog, DialogActions, LoadingCircle } from "@self-learning/ui/common";
import { useState } from "react";
import { GoalsOverview, LearningGoals } from "../goals/learning-goals";
import { LearningGoal } from "@self-learning/types";

export function LearningGoalInputTile({ goals: displayGoals }: { goals: LearningGoal[] }) {
	const [dialogOpen, setDialogOpen] = useState<boolean>(false);

	const { data: learningGoals, isLoading } = trpc.learningGoal.loadLearningGoal.useQuery();

	const onClose = () => {
		setDialogOpen(false);
	};

	if (!learningGoals || isLoading) {
		return (
			<Tile onToggleEdit={setDialogOpen} tileName={"Lernziele"} isFilled={false}>
				<LoadingCircle />;
			</Tile>
		);
	}
	return (
		<div>
			<Tile onToggleEdit={setDialogOpen} tileName={"Lernziele"} isFilled={false}>
				<div>
					<GoalsOverview
						goals={displayGoals}
						notFoundMessage={"Es wurden noch keine Lernziele Festgelegt"}
						editable={false}
						onRowClick={() => setDialogOpen(true)}
					/>
				</div>
			</Tile>
			{dialogOpen && (
				<Dialog title="Lernziel Editor" onClose={onClose}>
					<div className={"overflow-y-auto"}>
						<div className={"space-y-4"}>
							<div className={"max-w-md py-2"}>
								<span>{"Hier muss noch ein Text rein!!!!!!!!!!!!!!!"}</span>
							</div>
						</div>
						<div className={"flex justify-center py-4"}>
							<LearningGoals goals={learningGoals} />
						</div>
						<DialogActions onClose={onClose} />
					</div>
				</Dialog>
			)}
		</div>
	);
}
