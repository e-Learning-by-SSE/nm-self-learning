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
	// Total Time of the User spent Learning in Seconds
	// const { data: totalData, isLoading: isLoadingTotal } = trpc.metrics.getUserTotalLearningTime.useQuery();
	// Daily Time of the User spent Learning in Seconds
	// const { data: dailyData, isLoading: isLoadingDaily } = trpc.metrics.getUserDailyLearningTime.useQuery();
	// Hourly Time of the User spent Learning in Seconds
	// const { data: hourlyData, isLoading: isLoadingHourly } = trpc.metrics.getUserHourlyLearningTime.useQuery();
	// Daily Quiz Stats of the User
	// const { data: quizData, isLoading: isLoadingQuiz } = trpc.metrics.getUserDailyQuizStats.useQuery();
	// Total Time of the User spent Learning by Course in Seconds
	// const { data: courseData, isLoading: isLoadingCourse } = trpc.metrics.getUserTotalLearningTimeByCourse.useQuery();
	// Average Course Completion Rate by Author by Course
	// const { data: authorByCourseData, isLoading: isLoadingAuthorByCourse } = trpc.metrics.getUserAverageCompletionRateByAuthorByCourse.useQuery();
	// Average Course Completion Rate by Author
	// const { data: authorData, isLoading: isLoadingAuthor } = trpc.metrics.getUserAverageCompletionRateByAuthor.useQuery();
	// Average Completion Rate by Author by Subject
	// const { data: authorBySubjectData, isLoading: isLoadingAuthorBySubject } = trpc.metrics.getUserAverageCompletionRateByAuthorBySubject.useQuery();
	// Daily Learning Time by Course
	// const { data: dailyByCourseData, isLoading: isLoadingDailyByCourse } = trpc.metrics.getUserDailyLearningTimeByCourse.useQuery();
	// Learning Streak
	// const { data: learningStreakData, isLoading: isLoadingLearningStreak } = trpc.metrics.getUserLearningStreak.useQuery();
	// Courses Completed by Subject
	// const { data: coursesCompletedBySubjectData, isLoading: isLoadingCoursesCompletedBySubject } = trpc.metrics.getUserCoursesCompletedBySubject.useQuery();
	// Total Average Lesson Completion Rate by Course by Author
	// const { data: totalAverageByCourseData, isLoading: isLoadingTotalAverageByCourse } = trpc.metrics.getTotalAverageLessonCompletionRateByCourseByAuthor.useQuery();
	// Total Average Lesson Completion Rate by Author
	// const { data: totalAverageByAuthorData, isLoading: isLoadingTotalAverageByAuthor } = trpc.metrics.getTotalAverageLessonCompletionRateByAuthor.useQuery();
	// Daily Average Lesson Completion Rate by Author
	// const { data: dailyAverageByAuthorData, isLoading: isLoadingDailyAverageByAuthor } = trpc.metrics.getDailyAverageLessonCompletionRateByAuthor.useQuery();

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
