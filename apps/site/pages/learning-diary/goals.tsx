import { withAuth, withTranslations } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { LearningGoals } from "@self-learning/diary";
import { LoadingBox } from "@self-learning/ui/common";
import { CenteredSection } from "@self-learning/ui/layouts";

export const getServerSideProps = withAuth(withTranslations(["common"]));

export default function LearningGoal() {
	const { data: goals, isLoading } = trpc.learningGoal.loadLearningGoal.useQuery();

	return (
		<CenteredSection className="overflow-y-auto bg-gray-50 pb-32 px-5">
			<section>
				{goals && <LearningGoals goals={goals} />}
				{isLoading && <LoadingBox />}
			</section>
		</CenteredSection>
	);
}
