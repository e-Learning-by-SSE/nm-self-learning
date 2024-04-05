import { authOptions } from "@self-learning/api";
import { database } from "@self-learning/database";
import { CenteredSection, ItemCardGrid } from "@self-learning/ui/layouts";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { ReactComponent as VoidSvg } from "../svg/void.svg";
import Select from "react-select";

import { Chart as ChartJS, registerables } from "chart.js";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-date-fns";

ChartJS.register(...registerables);

import { SectionHeader } from "@self-learning/ui/common";
import { ResolvedValue } from "@self-learning/types";
import {
	LearningAnalyticsMetric,
	getLineChartData,
	getMetricName,
	getMetrics,
	getOptions,
	notNull
} from "@self-learning/learning-analytics";
import { useState } from "react";

type LearningAnalyticsProps = {
	lASession: LearningAnalyticsType;
};

export type LearningAnalyticsType = ResolvedValue<typeof getLASession>;

/**
 * Fetch learning analytic data from database
 * @param username The username of the current user
 * @returns The learning analytic data of the user
 */
async function getLASession(username: string) {
	return await database.lASession.findMany({
		where: { username: username },
		orderBy: {
			start: "asc"
		},
		select: {
			start: true,
			end: true,
			learningAnalytics: {
				select: {
					sessionId: true,
					lessonId: true,
					lesson: true,
					courseId: true,
					course: true,
					start: true,
					end: true,
					quizStart: true,
					quizEnd: true,
					numberCorrectAnswers: true,
					numberIncorrectAnswers: true,
					numberOfUsedHints: true,
					numberOfChangesMediaType: true,
					preferredMediaType: true,
					videoStart: true,
					videoEnd: true,
					videoBreaks: true,
					videoSpeed: true
				}
			}
		}
	});
}

/**
 * Checks if the current user is login and prepares learning analytic session data for the page.
 * @param ctx The context of the current request
 * @returns The learning analytic session data of the current user
 */
export const getServerSideProps: GetServerSideProps<LearningAnalyticsProps> = async ctx => {
	const session = await getServerSession(ctx.req, ctx.res, authOptions);
	if (!session?.user?.name) {
		return { redirect: { destination: "/login?callbackUrl=learning-diary", permanent: false } };
	}
	const lASession = JSON.parse(JSON.stringify(await getLASession(session.user.name)));
	return {
		props: {
			lASession: lASession as LearningAnalyticsType
		}
	};
};

/**
 * Returns all course/lesson titles, for which learning analytics data is available for the current user.
 * @param lASession Learning analytic session data
 * @param entry "course" for course titles, "lesson" for lesson titles
 * @returns all course/lesson titles, which are included in the learning analytic data.
 */
function identifyParticipation(lASession: LearningAnalyticsType, entry: "course" | "lesson") {
	const result = [{ value: "Alle", label: "Alle" }];
	lASession.forEach(session => {
		session.learningAnalytics
			.map(learningAnalytic => learningAnalytic[entry])
			.filter(notNull)
			.map(entry => entry.title)
			.forEach(title => {
				if (!result.find(item => item.value === title)) {
					result.push({ value: title, label: title });
				}
			});
	});
	return result;
}

/**
 * Filters the learning analytics by course/lesson title and keeps only the filtered data.
 * @param lASession Learning analytic session data
 * @param value The selected entries to filter for, "Alle" for no filtering
 * @param entry "course" for course titles, "lesson" for lesson titles
 */
function filterLaSession(
	lASession: LearningAnalyticsType,
	value: string,
	entry: "course" | "lesson"
) {
	if (value != "Alle")
		lASession.forEach(session => {
			session.learningAnalytics = session.learningAnalytics.filter(
				item => item[entry]?.title === value
			);
		});
}

/**
 * Filters the learning analytics by date
 * @param lASession Learning analytic session data
 * @param days Number of days, which a included after filtering
 * @returns Learning analytic session data which are not older than the specified days
 */
export function filterLASessionByDate(lASession: LearningAnalyticsType, days: number) {
	let lASessionFilterByTime: LearningAnalyticsType = lASession;
	if (days > -1) {
		const firstDateOfRange = new Date();
		firstDateOfRange.setDate(new Date().getDate() - days);
		firstDateOfRange.setHours(0, 0, 0, 0);
		lASessionFilterByTime = lASession.filter(item => item.start >= firstDateOfRange);
	}
	return lASessionFilterByTime;
}

/**
 * LearningAnalytics()
 * Main component of the learning analytics: includes filtering options and the Statistic component
 *
 * props: 	learning analytic session data
 *
 */
export default function LearningAnalytics(props: Readonly<LearningAnalyticsProps>) {
	const [selectedCourse, setSelectedCourse] = useState("Alle");
	const [selectedLesson, setSelectedLesson] = useState("Alle");
	const [selectedTime, setSelectedTime] = useState(-1);

	const lASessionFilterByTime = filterLASessionByDate(props.lASession, selectedTime);
	const lASessionFilteredByCourse = JSON.parse(JSON.stringify(lASessionFilterByTime));
	filterLaSession(lASessionFilteredByCourse, selectedCourse, "course");
	const lASessionFilteredByLesson = JSON.parse(JSON.stringify(lASessionFilteredByCourse));
	filterLaSession(lASessionFilteredByLesson, selectedLesson, "lesson");
	return (
		<CenteredSection className="bg-gray-50">
			<h1 className="mb-16 text-5xl">Statistik</h1>
			<div className="flex flex-col">
				<div className="flex justify-between">
					<SectionHeader
						title="Lernsession"
						subtitle="Auswahl der Filter für die Statistik."
					/>
				</div>
				<div className="mb-2 flex flex-row items-center">
					<div className="mx-auto flex w-full flex-row justify-between gap-4">
						<span>Kurs:</span>
					</div>
					<span className="ml-5">
						<div style={{ width: "500px" }}>
							<Select
								id={"courseFilter"}
								instanceId={"courseFilter"}
								isSearchable={true}
								defaultValue={{ value: "Alle", label: "Alle" }}
								onChange={e => {
									setSelectedCourse(e?.value as string);
									setSelectedLesson("Alle");
								}}
								options={identifyParticipation(props.lASession, "course")}
							/>
						</div>
					</span>
				</div>
				<div className="mb-2 flex flex-row items-center">
					<div className="mx-auto flex w-full flex-row justify-between gap-4">
						<span>Lerneinheit:</span>
					</div>
					<span className="ml-5">
						<div style={{ width: "500px" }}>
							<Select
								id={"lessonFilter"}
								instanceId={"lessonFilter"}
								isSearchable={true}
								defaultValue={{ value: "Alle", label: "Alle" }}
								value={{ value: selectedLesson, label: selectedLesson }}
								onChange={e => {
									setSelectedLesson(e?.value as string);
								}}
								options={identifyParticipation(lASessionFilteredByCourse, "lesson")}
							/>
						</div>
					</span>
				</div>
				<div className="mb-2 flex flex-row items-center">
					<div className="<mx-auto gap-4> flex w-full flex-row justify-between">
						<span>Zeitspanne:</span>
					</div>
					<span className="ml-5">
						<div style={{ width: "500px" }}>
							<Select
								id={"timeFilter"}
								instanceId={"timeFilter"}
								isSearchable={true}
								defaultValue={{ value: -1, label: "Gesamter Zeitraum" }}
								onChange={e => {
									setSelectedTime(e?.value as number);
								}}
								options={[
									{ value: -1, label: "Gesamter Zeitraum" },
									{ value: 30, label: "30 Tage" },
									{ value: 7, label: "7 Tage" }
								]}
							/>
						</div>
					</span>
				</div>
			</div>
			<Statistic lASession={lASessionFilteredByLesson} />
		</CenteredSection>
	);
}

/**
 * LearningAnalytics()
 * Shows the metrics as ItemCardGrid and for the selected metric a line graph (react-chartjs-2) representing the metric values per day
 *
 * lASession: 	learning analytic session data
 *
 */
function Statistic({
	lASession
}: Readonly<{
	lASession: LearningAnalyticsType;
}>) {
	const metrics = getMetrics(lASession);
	const [selectedMetric, setSelectedMetric] = useState(
		LearningAnalyticsMetric.preferredLearningTime
	);
	const data = getLineChartData(lASession, selectedMetric);
	const options = getOptions(lASession, selectedMetric);

	return (
		<div className="flex flex-col">
			<div className="flex justify-between">
				<SectionHeader
					title="Metriken"
					subtitle="Auswahl der Metrik für die graphische Darstellung der Statistik."
				/>
			</div>
			<div className="bg-gray-50 pb-32">
				<div className="mx-auto flex max-w-screen-xl flex-col px-4 pt-8 xl:px-0">
					{metrics.length > 0 ? (
						<ItemCardGrid>
							{metrics.map(metric => (
								<MetricCard
									key={metric.metric}
									metric={metric.metric}
									metricValue={metric.value}
									selectMetric={setSelectedMetric}
									selectedMetric={selectedMetric}
								/>
							))}
						</ItemCardGrid>
					) : (
						<div className="grid gap-16 pt-16">
							<span className="mx-auto font-semibold">
								Leider gibt es hier noch keine Inhalte.
							</span>
							<div className="mx-auto w-full max-w-md ">
								<VoidSvg />
							</div>
						</div>
					)}
				</div>
			</div>
			{data && options == null && <Line data={data} />}
			{data && options && <Line data={data} options={options} />}
		</div>
	);
}

/**
 * MetricCard()
 * Shows the metrics value and name
 *
 * metric: 			metric that is shown on the card
 * metricValue:		value of a metric
 * selectMetric:	function to set the current selected metric
 * selectedMetric:	current selected metric
 *
 */

function MetricCard({
	metric,
	metricValue,
	selectMetric,
	selectedMetric
}: Readonly<{
	metric: LearningAnalyticsMetric;
	metricValue: string | number;
	selectMetric: (metric: LearningAnalyticsMetric) => void;
	selectedMetric: LearningAnalyticsMetric;
}>) {
	let className = "flex h-full flex-col justify-between gap-4 rounded-b-lg p-4 ";
	if (selectedMetric === metric) {
		className = className + " bg-emerald-500";
	}

	return (
		<button onClick={() => selectMetric(metric)}>
			<div className="glass relative flex h-full w-full flex-col rounded-lg transition-transform hover:scale-105 hover:bg-emerald-500 hover:shadow-lg">
				<div className={className}>
					<div className="flex flex-col items-center gap-4">
						<h2 className="text-2xl">{metricValue}</h2>
						<div className="items-center gap-4 text-center">
							<span>{getMetricName(metric)}</span>
						</div>
					</div>
				</div>
			</div>
		</button>
	);
}
