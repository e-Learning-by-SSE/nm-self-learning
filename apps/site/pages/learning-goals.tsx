import { LearningGoals } from "@self-learning/learning-goals";
import { trpc } from "@self-learning/api-client";
import { LoadingCircle } from "@self-learning/ui/common";

/**
 * LearningGoal()
 *
 * Main component of the learning goals
 *
 */
export default function LearningGoal() {
	const { data: learningGoals, isLoading } = trpc.learningGoal.loadLearningGoal.useQuery();
	if (isLoading) {
		// Loading screen, circle centered based on: https://stackoverflow.com/a/55174568
		return (
			<div className="flex h-screen bg-gray-50">
				<div className="m-auto">
					<LoadingCircle />
				</div>
			</div>
		);
	} else if (learningGoals) {
		// prisma Date string problem -> workaround JSON parse
		return <LearningGoals goals={JSON.parse(JSON.stringify(learningGoals))}  onEdit={(changedGoal) => {}}/>;
	} else {
		return <LearningGoals goals={null} onEdit={(changedGoal) => {}}/>;
	}
}
