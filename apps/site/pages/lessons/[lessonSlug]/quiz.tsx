import { withTranslations } from "@self-learning/api";
import { getSspStandaloneLessonLayout, StandaloneLessonLayout } from "@self-learning/lesson";
import { getSspQuizLearnersView, QuestionProps, Quiz, QuizLearnersView } from "@self-learning/quiz";
import { withAuth } from "@self-learning/util/auth";

export const getServerSideProps = withTranslations(
	["common"],
	withAuth<QuestionProps>(async ({ params }) => {
		const parentProps = await getSspStandaloneLessonLayout(params);

		if ("notFound" in parentProps) return { notFound: true };

		const quiz = parentProps.lesson.quiz as Quiz | null;
		if (!quiz) return { notFound: true };

		return getSspQuizLearnersView(parentProps);
	})
);

export default function StandaloneLessonQuizPage(props: QuestionProps) {
	return <QuizLearnersView {...props} />;
}

StandaloneLessonQuizPage.getLayout = StandaloneLessonLayout;
