import { withTranslations } from "@self-learning/api";
import {
	getSspLearnersView,
	getSSpLessonCourseLayout,
	LessonLayout,
	LessonLearnersView,
	LessonLearnersViewProps
} from "@self-learning/lesson";
import { withAuth } from "@self-learning/util/auth";

export const getServerSideProps = withTranslations(["common"], async context => {
	return withAuth(async (_, user) => {
		const props = await getSSpLessonCourseLayout(context.params);
		if ("notFound" in props) return { notFound: true };
		return getSspLearnersView(props, user);
	})(context);
});

export default function LessonPage(props: LessonLearnersViewProps) {
	return <LessonLearnersView {...props} key={props.lesson.lessonId} />;
}

LessonPage.getLayout = LessonLayout;
