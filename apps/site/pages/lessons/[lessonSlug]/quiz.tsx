import {
	getStaticPropsForStandaloneLessonLayout,
	StandaloneLessonLayout
} from "@self-learning/lesson";
import { compileQuizMarkdown, Quiz } from "@self-learning/quiz";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { QuizLearnersView, QuestionProps } from "@self-learning/quiz";

export const getServerSideProps: GetServerSideProps<QuestionProps> = async ({ params, locale }) => {
	const parentProps = await getStaticPropsForStandaloneLessonLayout(params);

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
};

export default function StandaloneLessonQuizPage({ lesson, quiz, markdown }: QuestionProps) {
	return <QuizLearnersView lesson={lesson} quiz={quiz} markdown={markdown} />;
}

StandaloneLessonQuizPage.getLayout = StandaloneLessonLayout;
