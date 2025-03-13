import { withAuth, withTranslations } from "@self-learning/api";
import { getLearningGoals, LearningGoals } from "@self-learning/diary";
import { ResolvedValue } from "@self-learning/types";

type Goals = ResolvedValue<typeof getLearningGoals>;

export const getServerSideProps = withTranslations(
	["common"],
	withAuth(async (context, user) => {
		const goals = await getLearningGoals(user.name);
		return {
			props: { goals }
		};
	})
);

export default function LearningGoal({ goals }: { goals: Goals }) {
	return <LearningGoals goals={goals} onStatusUpdate={_ => {}} />;
}
