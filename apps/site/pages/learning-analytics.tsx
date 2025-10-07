import { LearningHeatmap, TeacherView, VideoDuration } from "@self-learning/analysis";
import { useState } from "react";
import { withTranslations } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";

const PreviewTypes = ["Videos", "Heatmap", "Teacher"] as const;

export const getServerSideProps = withTranslations(["common"]);

export default function Page() {
	const [metricSelection, setMetricSelection] = useState("Heatmap");

	const renderMetricComponent = (metricSelection: string) => {
		switch (metricSelection) {
			case "Videos":
				return <VideoDuration />;
			case "Heatmap":
				return <LearningHeatmap />;
			case "Teacher":
				return (
					<>
						<h1>Teilnahmeübersicht</h1>
						<TeacherView />;
					</>
				);
			default:
				return null;
		}
	};

	// Total Time of the User spent Learning in Seconds
	// const { data: totalData, isLoading: isLoadingTotal } = trpc.KPIRouter.getUserTotalLearningTime.useQuery();
	// Daily Time of the User spent Learning in Seconds
	// const { data: dailyData, isLoading: isLoadingDaily } = trpc.KPIRouter.getUserDailyLearningTime.useQuery();
	// Daily Quiz Stats of the User
	// const { data: quizData, isLoading: isLoadingQuiz } = trpc.KPIRouter.getUserDailyQuizStats.useQuery();
	// Total Time of the User spent Learning by Course in Seconds
	// const { data: courseData, isLoading: isLoadingCourse } = trpc.KPIRouter.getUserTotalLearningTimeByCourse.useQuery();
	// Average Course Completion Rate by Author by Course
	// const { data: authorByCourseData, isLoading: isLoadingAuthorByCourse } = trpc.KPIRouter.getUserAverageCourseCompletionRateByAuthorByCourse.useQuery();
	// Average Course Completion Rate by Author
	// const { data: authorData, isLoading: isLoadingAuthor } = trpc.KPIRouter.getUserAverageCourseCompletionRateByAuthor.useQuery();

	return (
		<div className="bg-gray-50">
			<select
				className="px-4 py-2 rounded  bg-sky-50"
				onChange={e => setMetricSelection(e.target.value)}
				value={metricSelection}
			>
				{PreviewTypes.map(type => (
					<option key={type} className="text-base font-sans" value={type}>
						{type}
					</option>
				))}
			</select>

			{renderMetricComponent(metricSelection)}
		</div>
	);
}
