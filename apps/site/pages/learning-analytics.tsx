"use client";

import { useState } from "react";
import { withTranslations } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { useSession } from "next-auth/react";
import StudentAnalytics from "/code/libs/feature/analysis/src/lib/components/student/StudentAnalytics";
import CreatorAnalytics from "/code/libs/feature/analysis/src/lib/components/creator/CreatorAnalytics";

/*
----------------------------------------------------------
 Professor’s prototype logic (kept as reference)
----------------------------------------------------------
This was the professor’s prototype for switching between
different analytics (videos, heatmap, teacher view).
We keep it commented to preserve the idea for later expansion.

 // import { LearningHeatmap, TeacherView, VideoDuration } from "@self-learning/analysis";
 // const PreviewTypes = ["Videos", "Heatmap", "Teacher"] as const;
 // const renderMetricComponent = (metricSelection: string) => { ... }
 // etc.
*/

export const getServerSideProps = withTranslations(["common"]);

/*
----------------------------------------------------------
 Active Logic: Role-Based Learning Analytics Page
----------------------------------------------------------
*/
export default function LearningAnalyticsPage() {
	const { data: session } = useSession();
	const role = session?.user?.role; // "USER" for student, "ADMIN" for creator

	// --- Erik’s KPI additions (keep for later use) ---
	// const { data: totalData, isLoading: isLoadingTotal } =
	// 	trpc.KPIRouter.getUserTotalLearningTime.useQuery();
	// const { data: dailyData, isLoading: isLoadingDaily } =
	// 	trpc.KPIRouter.getUserDailyLearningTime.useQuery();
	// const { data: quizData, isLoading: isLoadingQuiz } =
	// 	trpc.KPIRouter.getUserDailyQuizStats.useQuery();
	// const { data: courseData, isLoading: isLoadingCourse } =
	// 	trpc.KPIRouter.getUserTotalLearningTimeByCourse.useQuery();

	if (!role) {
		return <p className="p-6">Loading...</p>;
	}

	// --- Role-based rendering ---
	return (
		<div className="bg-gray-50 min-h-screen">
			{role === "ADMIN" ? <CreatorAnalytics /> : <StudentAnalytics />}
		</div>
	);
}
