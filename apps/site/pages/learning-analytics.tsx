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
	getOptions
} from "@self-learning/learning-analytics";
import { useState } from "react";

type LearningAnalyticsProps = {
	lASession: ResolvedValue<typeof getLASession>;
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
			lASession: lASession as ResolvedValue<typeof getLASession>
		}
	};
};

/**
 * Returns all course titles, which are included in the learning analytic data.
 * @param lASession Learning analytic session data
 * @returns all course titles, which are included in the learning analytic data.
 */
export function getCourses(lASession: ResolvedValue<typeof getLASession>) {
	const courses = [{ value: "Alle", label: "Alle" }];
	lASession.forEach(session => {
		session.learningAnalytics.forEach(learningAnalytic => {
			if (learningAnalytic.course?.title)
				if (
					courses.findIndex(item => item.value === learningAnalytic.course?.title) === -1
				) {
					courses.push({
						value: learningAnalytic.course?.title,
						label: learningAnalytic.course?.title
					});
				}
		});
	});
	return courses;
}

/**
 * Returns all lesson titles, which are included in the learning analytic data.
 * @param lASession learning analytic session data
 * @returns All lesson titles, which are included in the learning analytic data
 */
export function getLessons(lASession: ResolvedValue<typeof getLASession>) {
	const lessons = [{ value: "Alle", label: "Alle" }];
	lASession.forEach(session => {
		session.learningAnalytics.forEach(learningAnalytic => {
			if (learningAnalytic.lesson?.title)
				if (
					lessons.findIndex(item => item.value === learningAnalytic.lesson?.title) === -1
				) {
					lessons.push({
						value: learningAnalytic.lesson?.title,
						label: learningAnalytic.lesson.title
					});
				}
		});
	});
	return lessons;
}

/**
 * Filters the learning analytics by course title
 * @param lASession Learning analytic session data
 * @param course Selected course title for filtering
 */
export function filterCourseLASession(
	lASession: ResolvedValue<typeof getLASession>,
	course: string
) {
	if (course != "Alle")
		lASession.forEach(session => {
			session.learningAnalytics = session.learningAnalytics.filter(
				item => item.course?.title === course
			);
		});
}

/**
 * Filters the learning analytics by lesson title
 * @param lASession Learning analytic session data
 * @param lesson The title of the lesson for filtering, or "Alle" for no filtering
 * @returns Learning analytic session data which are filtered by the lesson title
 */
export function filterLASessionByLesson(
	lASession: ResolvedValue<typeof getLASession>,
	lesson: string
) {
	if (lesson != "Alle")
		lASession.forEach(session => {
			session.learningAnalytics = session.learningAnalytics.filter(
				item => item.lesson?.title === lesson
			);
		});
}

/**
 * Filters the learning analytics by date
 * @param lASession Learning analytic session data
 * @param days Number of days, which a included after filtering
 * @returns Learning analytic session data which are not older than the specified days
 */
export function filterLASessionByDate(lASession: ResolvedValue<typeof getLASession>, days: number) {
	let lASessionFilterByTime: ResolvedValue<typeof getLASession> = lASession;
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
	filterCourseLASession(lASessionFilteredByCourse, selectedCourse);
	const lASessionFilteredByLesson = JSON.parse(JSON.stringify(lASessionFilteredByCourse));
	filterLASessionByLesson(lASessionFilteredByLesson, selectedLesson);
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
								options={getCourses(props.lASession)}
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
								options={getLessons(lASessionFilteredByCourse)}
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
	lASession: ResolvedValue<typeof getLASession>;
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
