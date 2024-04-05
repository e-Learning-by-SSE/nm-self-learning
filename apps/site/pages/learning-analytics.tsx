import { authOptions } from "@self-learning/api";
import { database } from "@self-learning/database";
import { SidebarEditorLayout } from "@self-learning/ui/layouts";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import Select from "react-select";
import { LabeledField } from "@self-learning/ui/forms";

import { Chart as ChartJS, registerables } from "chart.js";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-date-fns";

ChartJS.register(...registerables);

import { Divider } from "@self-learning/ui/common";
import { ResolvedValue } from "@self-learning/types";
import {
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

	const metrics = getMetrics(lASessionFilteredByLesson);
	const [selectedMetric, setSelectedMetric] = useState(metrics[0]);
	const data = getLineChartData(lASessionFilteredByLesson, selectedMetric.metric);
	const options = getOptions(lASessionFilteredByLesson, selectedMetric.metric);

	return (
		<div className="bg-gray-50">
			<SidebarEditorLayout
				sidebar={
					<>
						<span className="text-2xl font-semibold text-secondary">
							Auswahl der Lernstatistiken
						</span>
						<p className="heading text-2xl">Lernsession</p>
						<p>Auswahlfilter für die Statistik.</p>

						<LabeledField label="Kurs">
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
						</LabeledField>

						<LabeledField label="Lerneinheit">
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
						</LabeledField>

						<LabeledField label="Zeitspanne"></LabeledField>
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
						<Divider />
						<p className="heading text-2xl">Metriken</p>
						{metrics.map(metric => (
							<button
								key={metric.metric}
								onClick={() => setSelectedMetric(metric)}
								className={`p-2 hover:text-gray-500 ${
									metric === selectedMetric ? "text-secondary" : ""
								}`}
							>
								<p className="... text-left">{getMetricName(metric.metric)}</p>
							</button>
						))}
					</>
				}
			>
				<h1 className="text-5xl">Statistik</h1>
				<span className="text-xl">
					<span className="font-bold">{getMetricName(selectedMetric.metric)}:</span>
					{` ${selectedMetric.value}`}
				</span>
				{data && options == null && <Line data={data} />}
				{data && options && <Line data={data} options={options} />}
			</SidebarEditorLayout>
		</div>
	);
}
