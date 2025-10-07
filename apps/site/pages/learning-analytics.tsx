// import { LearningHeatmap, TeacherView, VideoDuration } from "@self-learning/analysis";
// import { useState } from "react";
// import { withTranslations } from "@self-learning/api";

// const PreviewTypes = ["Videos", "Heatmap", "Teacher"] as const;

// export const getServerSideProps = withTranslations(["common"]);

// export default function Page() {
// 	const [metricSelection, setMetricSelection] = useState("Heatmap");

// 	const renderMetricComponent = (metricSelection: string) => {
// 		switch (metricSelection) {
// 			case "Videos":
// 				return <VideoDuration />;
// 			case "Heatmap":
// 				return <LearningHeatmap />;
// 			case "Teacher":
// 				return (
// 					<>
// 						<h1>Teilnahmeübersicht</h1>
// 						<TeacherView />;
// 					</>
// 				);
// 			default:
// 				return null;
// 		}
// 	};

// 	return (
// 		<div className="bg-gray-50">
// 			<select
// 				className="px-4 py-2 rounded  bg-sky-50"
// 				onChange={e => setMetricSelection(e.target.value)}
// 				value={metricSelection}
// 			>
// 				{PreviewTypes.map(type => (
// 					<option key={type} className="text-base font-sans" value={type}>
// 						{type}
// 					</option>
// 				))}
// 			</select>

// 			{renderMetricComponent(metricSelection)}
// 		</div>
// 	);
// }
// import { useSession } from "next-auth/react";
// import StudentAnalytics from "/code/libs/feature/analysis/src/lib/components/student/StudentAnalytics";
// import CreatorAnalytics from "/code/libs/feature/analysis/src/lib/components/creator/CreatorAnalytics";

// export default function LearningAnalyticsPage() {
// 	const { data: session } = useSession();
// 	const role = session?.user?.role; // likely "USER" or "ADMIN"

// 	if (!role) {
// 		return <p className="p-6">Loading...</p>;
// 	}

// 	return <div>{role === "ADMIN" ? <CreatorAnalytics /> : <StudentAnalytics />}</div>;
// }

import { useSession } from "next-auth/react";
import StudentAnalytics from "/code/libs/feature/analysis/src/lib/components/student/StudentAnalytics";
import CreatorAnalytics from "/code/libs/feature/analysis/src/lib/components/creator/CreatorAnalytics";

export default function LearningAnalyticsPage() {
	const { data: session } = useSession();
	const role = session?.user?.role; // "USER" for student, "ADMIN" for creator

	if (!role) {
		return <p className="p-6">Loading...</p>;
	}

	return role === "ADMIN" ? <CreatorAnalytics /> : <StudentAnalytics />;
}
