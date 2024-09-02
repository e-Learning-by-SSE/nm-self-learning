import { CourseView, LessonView, VideoDuration } from "@self-learning/ui/common";
import { useState } from "react";

type Preview = "Videos" | "Courses" | "Lessons";

export default function Page() {
	const [metricSelection, setMetricSelection] = useState<Preview>("Videos");

	return (
		<div className="bg-gray-50">
			<div className="flex space-x-4">
				<button
					className="bg-blue-500 text-white px-4 py-2 rounded"
					onClick={e => setMetricSelection("Videos")}
				>
					Video Duration
				</button>
				<button
					className="bg-green-500 text-white px-4 py-2 rounded"
					onClick={e => setMetricSelection("Courses")}
				>
					Courses
				</button>
				<button
					className="bg-sky-500 text-white px-4 py-2 rounded"
					onClick={e => setMetricSelection("Lessons")}
				>
					Courses
				</button>
			</div>

			{metricSelection === "Videos" ? <VideoDuration /> : null}
			{metricSelection === "Courses" ? <CourseView /> : null}
			{metricSelection === "Lessons" ? <LessonView /> : null}
		</div>
	);
}
