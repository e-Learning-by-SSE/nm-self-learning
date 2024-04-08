import { ChartData, ChartOptions } from "chart.js";
import { PREFERRED_LEARNING_TIME_METRIC } from "./learning-time";
import { DURATION_METRIC } from "./duration";
import { VIDEO_SPEED_METRIC } from "./video-speed";
import { VIDEO_DURATION_METRIC } from "./video-duration";
import { MEDIA_CHANGES_METRIC } from "./media-changes";
import { PREFERRED_MEDIA_TYPE_METRIC } from "./preferred-media-type";
import { ANSWERS_METRIC } from "./answers";
import { LearningAnalyticsType } from "../learning-analytics";
import { HINTS_METRIC } from "./hints";
import { QUIZ_PER_WEEK_METRIC } from "./quiz-per-week";
import { VIDEO_STOPS_METRIC } from "./video-stops";

export type MetricType = {
	metric: string;
	name: string;
	summary: (lASession: LearningAnalyticsType) => string;
	data: (lASession: LearningAnalyticsType) => ChartData<"line", number[], string> | null;
	options: ChartOptions<"line">;
};

/**
 * Lists all supported metrics.
 * Order will also be used for the display order.
 */
export const METRICS: MetricType[] = [
	PREFERRED_LEARNING_TIME_METRIC,
	DURATION_METRIC,
	VIDEO_SPEED_METRIC,
	VIDEO_DURATION_METRIC,
	VIDEO_STOPS_METRIC,
	MEDIA_CHANGES_METRIC,
	PREFERRED_MEDIA_TYPE_METRIC,
	QUIZ_PER_WEEK_METRIC,
	ANSWERS_METRIC,
	HINTS_METRIC
];
