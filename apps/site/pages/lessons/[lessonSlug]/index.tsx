import { LessonType } from "@prisma/client";
import {
	getStaticPropsForStandaloneLessonLayout,
	LessonLearnersView,
	LessonProps,
	StandaloneLessonLayout
} from "@self-learning/lesson";
import { compileMarkdown } from "@self-learning/markdown";
import { findContentType, LessonContent } from "@self-learning/types";
import { withAuth, withTranslations } from "@self-learning/api";

export const getServerSideProps = withTranslations(["common"], async context => {
	return withAuth(async _user => {
		const props = await getStaticPropsForStandaloneLessonLayout(context.params);

		if ("notFound" in props) return { notFound: true };

		const { lesson } = props;

		lesson.quiz = null;
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
			article.value.content = "(replaced)";
		}

		if (lesson.lessonType === LessonType.SELF_REGULATED) {
			mdQuestion = await compileMarkdown(lesson.selfRegulatedQuestion ?? "Kein Inhalt.");
		}

		return {
			props: {
				...props,
				course: null,
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

export default function StandaloneLessonPage({ lesson, markdown }: LessonProps) {
	return <LessonLearnersView lesson={lesson} markdown={markdown} />;
}

StandaloneLessonPage.getLayout = StandaloneLessonLayout;
