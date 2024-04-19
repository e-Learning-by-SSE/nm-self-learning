import { PreferredLearningTime } from "./learning-time";
import { VideoSpeed } from "./video-speed";
import { VideoDuration } from "./video-duration";
import { MediaChanges } from "./media-changes";
import { PreferredMediaType } from "./preferred-media-type";
import { Answers } from "./answers";
import { LearningAnalyticsType } from "@self-learning/types";
import { Hints } from "./hints";
import { QuizPerWeek } from "./quiz-per-week";
import { VideoStops } from "./video-stops";
import { Duration } from "./duration";
import { Quiz } from "./quiz";

/**
 * Stores all available unary metrics.
 * Key is used to distinguish between different metrics, e.g., for the selection and display of the metric.
 * Name is the display name of the metric (may be translated to support i18n).
 * Order will also be used for the display order for the metric selection.
 */
export const UNARY_METRICS = {
	PreferredLearningTime: "Präferierte Lernzeit",
	Duration: "Durchschnittliche Lernzeit",
	VideoSpeed: "Durchschnittliche Videogeschwindigkeit",
	VideoDuration: "Durchschnittliche Videodauer",
	VideoStops: "Durchschnittliche Anzahl an Videostopps",
	MediaChanges: "Durchschnittliche Anzahl an Medienwechseln",
	PreferredMediaType: "Bevorzugter Medientyp",
	QuizPerWeek: "Durchschnittliche Anzahl Lernzielkontrollen",
	Answers: "Durchschnittliche Anzahl an Antworten",
	Hints: "Durchschnittliche Anzahl an Hilfestellungen",
	Quiz: "Durchschnittliche Anzahl an Antworten und Hilfestellungen"
};

/**
 * "Enum" of available metrics. Should be used for metric (and its component) selection.
 */
export type UnaryMetric = keyof typeof UNARY_METRICS;

/**
 * Factory: Selects and displays heading, summary, and chart for the selected unary metric.
 * @param lASession The (filtered) session for which the metric is computed for.
 * @param metric The user selected metric.
 * @returns The component to display the metric.
 */
export function UnaryMetric({
	lASession,
	metric
}: {
	lASession: LearningAnalyticsType;
	metric: UnaryMetric;
}) {
	// Order does not matter, but all metrics must be covered.
	switch (metric) {
		case "PreferredLearningTime":
			return <PreferredLearningTime lASession={lASession} emphasisStyle="font-bold" />;
		case "Duration":
			return <Duration lASession={lASession} emphasisStyle="font-bold" />;
		case "VideoSpeed":
			return <VideoSpeed lASession={lASession} emphasisStyle="font-bold" />;
		case "VideoDuration":
			return <VideoDuration lASession={lASession} emphasisStyle="font-bold" />;
		case "VideoStops":
			return <VideoStops lASession={lASession} emphasisStyle="font-bold" />;
		case "MediaChanges":
			return <MediaChanges lASession={lASession} emphasisStyle="font-bold" />;
		case "PreferredMediaType":
			return <PreferredMediaType lASession={lASession} emphasisStyle="font-bold" />;
		case "QuizPerWeek":
			return <QuizPerWeek lASession={lASession} emphasisStyle="font-bold" />;
		case "Answers":
			return <Answers lASession={lASession} emphasisStyle="font-bold" />;
		case "Hints":
			return <Hints lASession={lASession} emphasisStyle="font-bold" />;
		case "Quiz":
			return <Quiz lASession={lASession} emphasisStyle="font-bold" />;
		default:
			return (
				<>
					<h1 className="text-5xl">Fehler</h1>
					<span className="text-xl">
						{`Unbekannte Metrik ausgewählt: `}
						<span className="font-bold">{UNARY_METRICS[metric]}</span>
						{`.`}
					</span>
				</>
			);
	}
}
