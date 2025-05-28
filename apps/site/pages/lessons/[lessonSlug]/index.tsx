import { withAuth, withTranslations } from "@self-learning/api";
import {
	getStaticLessonProps,
	getStaticPropsForStandaloneLessonLayout,
	LessonLearnersView,
	LessonProps,
	StandaloneLessonLayout
} from "@self-learning/lesson";

export const getServerSideProps = withTranslations(["common"], async context => {
	return withAuth(async _user => {
		const props = await getStaticPropsForStandaloneLessonLayout(context.params);

		if ("notFound" in props) return { notFound: true };

		const { lesson } = props;
		lesson.quiz = null;
		const lessonProps = await getStaticLessonProps(lesson);

		return {
			props: {
				...props,
				course: null,
				markdown: {
					...lessonProps
				}
			}
		};
	})(context);
});

export default function StandaloneLessonPage({ lesson, markdown }: LessonProps) {
	return <LessonLearnersView lesson={lesson} markdown={markdown} />;
}

StandaloneLessonPage.getLayout = StandaloneLessonLayout;
