import { withAuth, withTranslations } from "@self-learning/api";
import {
	getStaticLessonProps,
	getStaticPropsForLessonCourseLayout,
	LessonLayout,
	LessonLearnersView,
	LessonProps
} from "@self-learning/lesson";

export const getServerSideProps = withTranslations(["common"], async context => {
	return withAuth(async _user => {
		const props = await getStaticPropsForLessonCourseLayout(context.params);

		if ("notFound" in props) return { notFound: true };

		const { lesson } = props;
		lesson.quiz = null; // Not needed on this page, but on /quiz
		const lessonProps = await getStaticLessonProps(lesson);

		return {
			props: {
				...props,
				course: props.course,
				markdown: {
					...lessonProps
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
