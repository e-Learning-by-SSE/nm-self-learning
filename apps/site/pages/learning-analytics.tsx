import { CourseView, LessonView, VideoDuration } from "@self-learning/analysis";
import { useState } from "react";

const PreviewTypes = ["Videos", "Courses", "Lessons"];

export default function Page() {
	const [metricSelection, setMetricSelection] = useState("Videos");

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

			{metricSelection === "Videos" ? <VideoDuration /> : null}
			{metricSelection === "Courses" ? <CourseView /> : null}
			{metricSelection === "Lessons" ? <LessonView /> : null}
		</div>
	);
}
