import { withTranslations } from "@self-learning/api";
import { LearningGoals, useLearningGoals } from "@self-learning/diary";
import { LoadingBox } from "@self-learning/ui/common";
import { CenteredSection } from "@self-learning/ui/layouts";
import { withAuth } from "@self-learning/util/auth";

export const getServerSideProps = withAuth(withTranslations(["common"]));

export default function LearningGoal() {
	const { userGoals, isLoading } = useLearningGoals();
	return (
		<CenteredSection className="overflow-y-auto bg-gray-50 pb-32 px-5">
			<section>{isLoading ? <LoadingBox /> : <LearningGoals goals={userGoals} />}</section>
		</CenteredSection>
	);
}
