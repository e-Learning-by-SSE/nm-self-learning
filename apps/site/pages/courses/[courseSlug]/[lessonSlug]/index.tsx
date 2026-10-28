import { withTranslations } from "@self-learning/api";
import {
	I18N_NAMESPACE as NS_LESSON,
	getSspLearnersView,
	getSSpLessonCourseLayout,
	LessonLayout,
	LessonLearnersView,
	LessonLearnersViewProps
} from "@self-learning/lesson";
import { withAuth } from "@self-learning/util/auth";
import { I18N_NAMESPACE as NS_UI_LESSON } from "@self-learning/ui/lesson";

export const getServerSideProps = withTranslations(
	[...new Set([...NS_LESSON, ...NS_UI_LESSON])],
	async context => {
		return withAuth(async (_, user) => {
			const props = await getSSpLessonCourseLayout(context.params);
			if ("notFound" in props) return { notFound: true };
			return getSspLearnersView(props, user);
		})(context);
	}
);

export default function LessonPage(props: LessonLearnersViewProps) {
	return <LessonLearnersView {...props} key={props.lesson.lessonId} />;
}

LessonPage.getLayout = LessonLayout;
