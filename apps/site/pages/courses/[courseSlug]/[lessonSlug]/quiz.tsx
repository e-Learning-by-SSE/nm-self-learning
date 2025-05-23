import { getStaticPropsForLayout, LessonLayout } from "@self-learning/lesson";
import { compileQuizMarkdown, Quiz } from "@self-learning/quiz";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { withAuth } from "@self-learning/api";
import { QuizLearnersView, QuestionProps } from "@self-learning/quiz";

export const getServerSideProps = withAuth<QuestionProps>(async ({params, locale}) => {
	const parentProps = await getStaticPropsForLayout(params);

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
