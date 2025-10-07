"use client";

import { useState } from "react";
import { withTranslations } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { useSession } from "next-auth/react";
import StudentAnalytics from "/code/libs/feature/analysis/src/lib/components/student/StudentAnalytics";
import CreatorAnalytics from "/code/libs/feature/analysis/src/lib/components/creator/CreatorAnalytics";

/* 
 
 // import { LearningHeatmap, TeacherView, VideoDuration } from "@self-learning/analysis";
 // const PreviewTypes = ["Videos", "Heatmap", "Teacher"] as const;
 // const renderMetricComponent = (metricSelection: string) => { ... }
 // etc.
 
 Purpose:
 This was the professor’s prototype showing how to switch between
 heatmap, video duration, and teacher view.
 Keeping it commented ensures we can refer back to the old logic
 if we need to replicate or expand functionality.
*/

// KPI setup
// const { data: totalData, isLoading: isLoadingTotal } = trpc.KPIRouter.getUserTotalLearningTime.useQuery();
// const { data: dailyData, isLoading: isLoadingDaily } = trpc.KPIRouter.getUserDailyLearningTime.useQuery();

export const getServerSideProps = withTranslations(["common"]);

/*
----------------------------------------------------------
 Active Logic :role-based Learning Analytics page
----------------------------------------------------------
*/
export default function LearningAnalyticsPage() {
	const { data: session } = useSession();
	const role = session?.user?.role; // "USER" for student, "ADMIN" for creator

	if (!role) {
		return <p className="p-6">Loading...</p>;
	}

	return (
		<div className="bg-gray-50 min-h-screen">
			{/* ✅ Student vs Creator view */}
			{role === "ADMIN" ? <CreatorAnalytics /> : <StudentAnalytics />}
		</div>
	);
}
