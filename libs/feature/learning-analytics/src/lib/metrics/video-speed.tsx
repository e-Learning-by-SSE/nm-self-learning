import {
	DEFAULT_LINE_CHART_OPTIONS,
	formatDate,
	maxKey,
	preferredValuePerSession
} from "../auxillary";
import { UNARY_METRICS } from "./metrics";

import { Chart as ChartJS, registerables } from "chart.js";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import { HTMLAttributes } from "react";
import { LearningAnalyticsType } from "@self-learning/api";

ChartJS.register(...registerables);

/**
 * Generates the Line Chart data for the preferred video speed per day.
 * @param lASession The (filtered) session for which the summary is computed for.
 * @returns Line Chart data for the preferred video speed per day
 */
function plotPreferredVideoSpeed(lASession: LearningAnalyticsType) {
	const out: { data: number[]; labels: string[] } = { data: [], labels: [] };
	let videoSpeeds = new Map();
	let lastsession = formatDate(lASession[0].start);
	let sessionStart = lastsession;
	lASession.forEach(session => {
		sessionStart = formatDate(session.start);
		if (sessionStart !== lastsession) {
			if (videoSpeeds.size > 0) {
				out.data.push(maxKey(videoSpeeds));
				out.labels.push(lastsession);
				videoSpeeds = new Map();
				lastsession = sessionStart;
			}
		}
		if (session?.learningAnalytics) {
			session.learningAnalytics.forEach(learningAnalytics => {
				if (learningAnalytics.lessonStart && learningAnalytics.videoSpeed != null) {
					if (videoSpeeds.has(learningAnalytics.videoSpeed))
						videoSpeeds.set(
							learningAnalytics.videoSpeed,
							videoSpeeds.get(learningAnalytics.videoSpeed) + 1
						);
					else videoSpeeds.set(learningAnalytics.videoSpeed, 1);
				}
			});
		}
	});
	if (videoSpeeds.size > 0) {
		out.data.push(maxKey(videoSpeeds));
		out.labels.push(sessionStart);
	}
	const data = {
		labels: out.labels,
		datasets: [
			{
				label: UNARY_METRICS["VideoSpeed"],
				fill: false,
				backgroundColor: "rgba(75,192,192,0.4)",
				pointBorderColor: "rgba(75,192,192,1)",
				pointBackgroundColor: "#fff",
				pointBorderWidth: 1,
				pointHoverRadius: 5,
				pointHoverBackgroundColor: "rgba(75,192,192,1)",
				pointHoverBorderColor: "rgba(220,220,220,1)",
				pointHoverBorderWidth: 2,
				pointRadius: 1,
				pointHitRadius: 10,
				data: out.data
			}
		]
	};
	return data;
}

/**
 * Component to display the metric "Video Speed" in the Learning Analytics Dashboard.
 * @param lASession The (filtered) session for which the metric is computed for.
 * @param emphasisStyle className to emphasize the summary (e.g. font-bold or italic).
 * @returns The component to display the metric "Video Speed".
 */
export function VideoSpeed({
	lASession,
	emphasisStyle
}: {
	lASession: LearningAnalyticsType;
	emphasisStyle?: HTMLAttributes<"span">["className"];
}) {
	const graphData = plotPreferredVideoSpeed(lASession);
	const style = emphasisStyle ? emphasisStyle : "";

	const displayActivities = lASession.flatMap(s => s.activities);
	return (
		<>
			<h1 className="text-5xl">{UNARY_METRICS["VideoSpeed"]}</h1>
			<span className="text-xl">
				{`Durchschnittlich hast du Videos mit `}
				<span className={style}>
					{preferredValuePerSession(displayActivities, "videoSpeed")}
				</span>
				{`-facher Geschwindigkeit Videos angeschaut.`}
			</span>
			<Line data={graphData} options={DEFAULT_LINE_CHART_OPTIONS} />
		</>
	);
}
