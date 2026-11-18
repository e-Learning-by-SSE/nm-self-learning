import { withTranslations } from "@self-learning/api";
import {
	I18N_NAMESPACE as NS_LESSON,
	LessonLayout,
	LessonLearnersView,
	LessonLearnersViewProps
} from "@self-learning/lesson";
import { withAuth } from "@self-learning/util/auth/server";
import { I18N_NAMESPACE as NS_UI_LESSON } from "@self-learning/ui/lesson";
import { getSspLearnersView, getSSpLessonCourseLayout } from "@self-learning/lesson/server";
import { useEnsureCourseEnrollment } from "@self-learning/enrollment";
import { showToast } from "@self-learning/ui/common";
import { useEffect } from "react";
import { useTranslation } from "next-i18next";

export const getServerSideProps = withTranslations(
	[...new Set(["common", ...NS_LESSON, ...NS_UI_LESSON])],
	async context => {
		return withAuth(async (_, user) => {
			const props = await getSSpLessonCourseLayout(context.params);
			if ("notFound" in props) return { notFound: true };
			return getSspLearnersView(props, user);
		})(context);
	}
);

export default function LessonPage(props: LessonLearnersViewProps) {
	const { ensureEnrolled } = useEnsureCourseEnrollment();
	const { t } = useTranslation("common");

	useEffect(() => {
		if (!props.course) return;

		void ensureEnrolled({ courseId: props.course.courseId }).catch(() => {
			showToast({
				type: "error",
				title: t("Error"),
				subtitle: t("Enrollment_Failed")
			});
		});
	}, [props.course, ensureEnrolled, t]);

	return <LessonLearnersView {...props} key={props.lesson.lessonId} />;
}

LessonPage.getLayout = LessonLayout;
