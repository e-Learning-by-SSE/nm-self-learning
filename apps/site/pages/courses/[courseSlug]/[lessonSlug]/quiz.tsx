import { withTranslations } from "@self-learning/api";
import { I18N_NAMESPACE as completionNamespaces } from "@self-learning/completion";
import { I18N_NAMESPACE as lessonNamespaces } from "@self-learning/lesson";
import { I18N_NAMESPACE as questionTypeNamespaces } from "@self-learning/question-types";
import { getSSpLessonCourseLayout, LessonLayout } from "@self-learning/lesson";
import {
	getSspQuizLearnersView,
	I18N_NAMESPACE as quizNamespaces,
	QuestionProps,
	Quiz,
	QuizLearnersView
} from "@self-learning/quiz";
import { withAuth } from "@self-learning/util/auth";
import { I18N_NAMESPACE as uiLessonNamespaces } from "@self-learning/ui/lesson";

// Collect dependency namespaces here: combining them in the quiz library triggers a circular
// dependency and can access a namespace before it has been initialized.
export const getServerSideProps = withTranslations(
	[
		...new Set([
			...quizNamespaces,
			...completionNamespaces,
			...lessonNamespaces,
			...questionTypeNamespaces,
			...uiLessonNamespaces
		])
	],
	withAuth<QuestionProps>(async ({ params }) => {
		const parentProps = await getSSpLessonCourseLayout(params);

		if ("notFound" in parentProps) return { notFound: true };

		const quiz = parentProps.lesson.quiz as Quiz | null;
		if (!quiz) return { notFound: true };

		return getSspQuizLearnersView(parentProps);
	})
);

export default function QuestionsPage({ course, lesson, quiz, markdown }: QuestionProps) {
	return <QuizLearnersView course={course} lesson={lesson} quiz={quiz} markdown={markdown} />;
}

QuestionsPage.getLayout = LessonLayout;
