import { withTranslations } from "@self-learning/api";
import {
	I18N_NAMESPACE as NS_LESSON,
	getSspLearnersView,
	getSspStandaloneLessonLayout,
	LessonLearnersView,
	LessonLearnersViewProps,
	StandaloneLessonLayout
} from "@self-learning/lesson";
import { withAuth } from "@self-learning/util/auth";

export const getServerSideProps = withTranslations(["common", ...NS_LESSON], async context => {
	return withAuth(async (_context, user) => {
		const props = await getSspStandaloneLessonLayout(context.params);

		if ("notFound" in props) {
			return { notFound: true };
		}
		return getSspLearnersView(props, user);
	})(context);
});

export default function StandaloneLessonPage(props: LessonLearnersViewProps) {
	return <LessonLearnersView {...props} />;
}

StandaloneLessonPage.getLayout = StandaloneLessonLayout;
