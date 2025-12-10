import { withAuth, withTranslations } from "@self-learning/api";
import {
	getStaticLessonProps,
	getStaticPropsForLessonCourseLayout,
	LessonLayout,
	LessonLearnersView,
	LessonProps
} from "@self-learning/lesson";
import { FloatingTutorButton } from "@self-learning/ai-tutor";

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
				markdown: {
					...lessonProps
				}
			}
		};
	})(context);
});

export default function LessonPage({ lesson, course, markdown }: LessonProps) {
	return (
		<>
			<LessonLearnersView
				lesson={lesson}
				course={course}
				markdown={markdown}
				key={lesson.lessonId}
			/>
			<FloatingTutorButton />
		</>
	);
}

LessonPage.getLayout = LessonLayout;
