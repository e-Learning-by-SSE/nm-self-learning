import { withTranslations } from "@self-learning/api";
import { I18N_NAMESPACE as completionNamespaces } from "@self-learning/completion";
import { I18N_NAMESPACE as lessonNamespaces } from "@self-learning/lesson";
import { I18N_NAMESPACE as questionTypeNamespaces } from "@self-learning/question-types";
import { getSspStandaloneLessonLayout, StandaloneLessonLayout } from "@self-learning/lesson";
import {
	getSspQuizLearnersView,
	I18N_NAMESPACE as quizNamespaces,
	QuestionProps,
	Quiz,
	QuizLearnersView
} from "@self-learning/quiz";
import { withAuth } from "@self-learning/util/auth";

// Collect dependency namespaces here: combining them in the quiz library triggers a circular
// dependency and can access a namespace before it has been initialized.
export const getServerSideProps = withTranslations(
	[
		...new Set([
			...quizNamespaces,
			...completionNamespaces,
			...lessonNamespaces,
			...questionTypeNamespaces
		])
	],
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
