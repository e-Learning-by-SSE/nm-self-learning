"use client";

import { trpc } from "@self-learning/api-client";
import { useTranslation } from "next-i18next";
import { CourseMetricsTable } from "./components/creator/CourseMetricsTable";

export function TeacherView() {
	const { t } = useTranslation("student-analytics");
	const { data, isLoading, isError } =
		trpc.metrics.getAuthorMetric_AverageCourseCompletionRate.useQuery(undefined);

	if (isLoading) return <p>{t("loadingDashboard")}</p>;
	if (isError || !data) return <p>{t("noDataAvailable")}</p>;

	const courses = data
		.map(row => ({
			courseId: row.courseId,
			label: row.courseTitle,
			rate: row.averageCompletionRate,
			enrollments: row.totalEnrollments,
			recentEnrollments: row.enrollmentsSemester,
			participation: row.totalParticipation,
			recentParticipation: row.participationSemester,
			recentRate: row.averageCompletionRateSemester
		}))
		.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));

	return <CourseMetricsTable courses={courses} />;
}
