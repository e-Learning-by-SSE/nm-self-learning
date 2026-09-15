import { withTranslations } from "@self-learning/api";
import {
	I18N_NAMESPACE as NS_LESSON,
	LessonLayout,
	LessonLearnersView,
	LessonLearnersViewProps
} from "@self-learning/lesson";
import { getSspLearnersView, getSSpLessonCourseLayout } from "@self-learning/lesson/server";
import { withAuth } from "@self-learning/util/auth/server";

export const getServerSideProps = withTranslations(["common", ...NS_LESSON], async context => {
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
