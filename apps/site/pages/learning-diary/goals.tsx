import { withTranslations } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { LearningGoals } from "@self-learning/diary";
import { LoadingCircle } from "@self-learning/ui/common";

export const getServerSideProps = withTranslations(["common"]);


export default function LearningGoal() {
	const { data: goals, isLoading } = trpc.learningGoal.loadLearningGoal.useQuery();


	if(isLoading) {
		return <LoadingCircle />
	}

	return goals && <LearningGoals goals={goals} onStatusUpdate={_ => {}} />;
}
