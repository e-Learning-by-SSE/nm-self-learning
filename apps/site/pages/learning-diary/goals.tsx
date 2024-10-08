import { getLearningGoals, LearningGoals } from "@self-learning/diary";
import { ResolvedValue } from "@self-learning/types";
import { withAuth } from "@self-learning/util/http";
import { GetServerSideProps } from "next";

type Goals = ResolvedValue<typeof getLearningGoals>;

export const getServerSideProps: GetServerSideProps = withAuth(async (_, user) => {
	const goals = await getLearningGoals(user.name);
	return {
		props: { goals }
	};
});

export default function LearningGoal({ goals }: { goals: Goals }) {
	return <LearningGoals goals={goals} onStatusUpdate={_ => {}} />;
}
