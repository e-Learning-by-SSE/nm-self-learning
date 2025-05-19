import { withTranslations } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { LearningGoals } from "@self-learning/diary";
import { LoadingCircle } from "@self-learning/ui/common";
import { useRequiredSession } from "@self-learning/ui/layouts";

export const getServerSideProps = withTranslations(["common"]);

export default function LearningGoal() {
	const { data: goals, isLoading } = trpc.learningGoal.loadLearningGoal.useQuery();
	useRequiredSession();

	if(isLoading) {
		return <LoadingCircle className="h-8 w-8" />
	}

	return goals && <LearningGoals goals={goals} onStatusUpdate={_ => {}} />;
}
