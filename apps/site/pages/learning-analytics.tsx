import { LearningHeatmap, TeacherView, VideoDuration } from "@self-learning/analysis";
import { useState } from "react";

const PreviewTypes = ["Videos", "Heatmap", "Teacher"] as const;

export default function Page() {
	const [metricSelection, setMetricSelection] = useState("Heatmap");

	const renderMetricComponent = (metricSelection: string) => {
		switch (metricSelection) {
			case "Videos":
				return <VideoDuration />;
			case "Heatmap":
				return <LearningHeatmap />;
			case "Teacher":
				return <TeacherView />;
			default:
				return null;
		}
	};

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
