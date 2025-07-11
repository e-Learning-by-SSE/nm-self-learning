import { withAuth } from "@self-learning/api";
import { getStaticPropsForLessonCourseLayout, LessonLayout } from "@self-learning/lesson";
import { compileQuizMarkdown, QuestionProps, Quiz, QuizLearnersView } from "@self-learning/quiz";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export const getServerSideProps = withAuth<QuestionProps>(async ({ params, locale }) => {
	const parentProps = await getStaticPropsForLessonCourseLayout(params);

	if ("notFound" in parentProps) return { notFound: true };

	const quiz = parentProps.lesson.quiz as Quiz | null;
	if (!quiz) return { notFound: true };

	const { questionsMd, answersMd, hintsMd, processedQuestions } = await compileQuizMarkdown(quiz);
	quiz.questions = processedQuestions;
	
	return {
		props: {
			...(await serverSideTranslations(locale ?? "en", ["common"])),
			...parentProps,
			quiz,
			markdown: { questionsMd, answersMd, hintsMd }
		}
	};
});

export default function QuestionsPage({ course, lesson, quiz, markdown }: QuestionProps) {
	return <QuizLearnersView course={course} lesson={lesson} quiz={quiz} markdown={markdown} />;
}

QuestionsPage.getLayout = LessonLayout;
