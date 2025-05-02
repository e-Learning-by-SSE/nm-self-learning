import { LessonType } from "@prisma/client";
import {
	getStaticPropsForLayout,
	LessonLayout,
	LessonLearnersView,
	LessonProps
} from "@self-learning/lesson";
import { compileMarkdown } from "@self-learning/markdown";
import { findContentType, LessonContent } from "@self-learning/types";
import { withAuth, withTranslations } from "@self-learning/api";

export const getServerSideProps = withTranslations(["common"], async context => {
	return withAuth(async _user => {
		const props = await getStaticPropsForLayout(context.params);

		if ("notFound" in props) return { notFound: true };

		const { lesson } = props;

		lesson.quiz = null; // Not needed on this page, but on /quiz
		let mdDescription = null;
		let mdArticle = null;
		let mdQuestion = null;
		let mdSubtitle = null;

		if (lesson.description) {
			mdDescription = await compileMarkdown(lesson.description);
		}

		if (lesson.subtitle && lesson.subtitle.length > 0) {
			mdSubtitle = await compileMarkdown(lesson.subtitle);
		}

		const { content: article } = findContentType("article", lesson.content as LessonContent);

		if (article) {
			mdArticle = await compileMarkdown(article.value.content ?? "Kein Inhalt.");

			// Remove article content to avoid duplication
			article.value.content = "(replaced)";
		}

		// TODO change to check if the lesson is self regulated
		if (lesson.lessonType === LessonType.SELF_REGULATED) {
			mdQuestion = await compileMarkdown(lesson.selfRegulatedQuestion ?? "Kein Inhalt.");
		}

		return {
			props: {
				...props,
				markdown: {
					article: mdArticle,
					description: mdDescription,
					preQuestion: mdQuestion,
					subtitle: mdSubtitle
				}
			}
		};
	})(context);
});

export default function LessonPage({ lesson, course, markdown }: LessonProps) {
	return (
		<LessonLearnersView
			lesson={lesson}
			course={course}
			markdown={markdown}
			key={lesson.lessonId}
		/>
	);
}

LessonPage.getLayout = LessonLayout;
