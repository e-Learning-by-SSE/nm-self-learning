import { LearningAnalyticsType } from "@self-learning/api";
import { SidebarEditorLayout } from "@self-learning/ui/layouts";
import Select from "react-select";
import { LabeledField } from "@self-learning/ui/forms";
import { trpc } from "@self-learning/api-client";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CalendarDaysIcon } from "@heroicons/react/24/solid";

import { Divider, LoadingCircle } from "@self-learning/ui/common";
import { UNARY_METRICS, UnaryMetric, notNull } from "@self-learning/learning-analytics";
import { useState } from "react";
import { format } from "date-fns";

import { Chart as ChartJS, registerables } from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(...registerables);

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
 * @param startDate The first date to consider or null if no start date is specified
 * @param endDate The last date to consider or null if no end date is specified
 * @returns The filtered learning analytic session data
 */
function filterSessionByDate(
	lASession: LearningAnalyticsType,
	startDate: Date | null,
	endDate: Date | null
) {
	let lASessionFilterByTime = lASession;

	if (startDate) {
		lASessionFilterByTime = lASessionFilterByTime.filter(
			item => new Date(item.start) >= startDate
		);
	}
	if (endDate) {
		lASessionFilterByTime = lASessionFilterByTime.filter(
			item => new Date(item.start) <= endDate
		);
	}

	return lASessionFilterByTime;
}

export default function Page() {
	const { data: lASession, isLoading } = trpc.learningAnalytics.loadLearningAnalytics.useQuery();

	if (isLoading) {
		// Loading screen, circle centered based on: https://stackoverflow.com/a/55174568
		return (
			<div className="flex h-screen bg-gray-50">
				<div className="m-auto">
					<LoadingCircle />
				</div>
			</div>
		);
	} else if (lASession) {
		return <LearningAnalytics lASession={lASession} />;
	}

	return (
		<div className="bg-gray-50">
			<p>Keine Daten vorhanden</p>
		</div>
	);
}

/**
 * LearningAnalytics()
 * Main component of the learning analytics: includes filtering options and the Statistic component
 *
 * props: 	learning analytic session data
 *
 */
function LearningAnalytics({ lASession }: { lASession: LearningAnalyticsType }) {
	const [selectedCourse, setSelectedCourse] = useState("Alle");
	const [selectedLesson, setSelectedLesson] = useState("Alle");

	// Selection of optional first and last date for the time filter
	const firstDate = Math.min(...lASession.map(item => new Date(item.start).getTime()));
	const lastDate = Math.max(...lASession.map(item => new Date(item.start).getTime()));
	const [startDate, setStartDate] = useState<Date | null>(new Date(firstDate));
	const [endDate, setEndDate] = useState<Date | null>(new Date(lastDate));

	const lASessionFilterByTime = filterSessionByDate(lASession, startDate, endDate);
	const lASessionFilteredByCourse = JSON.parse(JSON.stringify(lASessionFilterByTime));
	filterLaSession(lASessionFilteredByCourse, selectedCourse, "course");
	const lASessionFilteredByLesson = JSON.parse(JSON.stringify(lASessionFilteredByCourse));
	filterLaSession(lASessionFilteredByLesson, selectedLesson, "lesson");

	const [selectedMetric, setSelectedMetric] = useState(Object.keys(UNARY_METRICS)[0]);
	// const data = selectedMetric.data(lASessionFilteredByLesson);
	// const options = selectedMetric.options;

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
								options={identifyParticipation(lASession, "course")}
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

						<LabeledField label="Zeitspanne (optional)">
							<div className="flex">
								<div className="w-1/2 pr-2">
									<DatePicker
										selected={startDate}
										onChange={setStartDate}
										selectsStart
										startDate={startDate}
										endDate={endDate}
										maxDate={endDate}
										showIcon
										icon={<CalendarDaysIcon />}
										isClearable
										closeOnScroll={true}
										dateFormat="dd.MM.yyyy"
										className="w-full rounded-md border-gray-300"
										placeholderText={`Startdatum (${format(
											firstDate,
											"dd.MM.yyyy"
										)})`}
									/>
								</div>
								<div className="w-1/2 pl-2">
									<DatePicker
										selected={endDate}
										onChange={setEndDate}
										selectsEnd
										startDate={startDate}
										endDate={endDate}
										minDate={startDate}
										showIcon
										icon={<CalendarDaysIcon />}
										isClearable={true}
										closeOnScroll={true}
										dateFormat="dd.MM.yyyy"
										className="w-full rounded-md border-gray-300"
										placeholderText={`Enddatum (${format(
											lastDate,
											"dd.MM.yyyy"
										)})`}
									/>
								</div>
							</div>
						</LabeledField>
						<Divider />
						<p className="heading text-2xl">Metriken</p>
						{Object.keys(UNARY_METRICS).map(metric => (
							<button
								key={metric}
								onClick={() => setSelectedMetric(metric)}
								className={`p-2 hover:text-gray-500 ${
									metric === selectedMetric ? "text-secondary" : ""
								}`}
							>
								<p className="... text-left">
									{UNARY_METRICS[metric as UnaryMetric]}
								</p>
							</button>
						))}
					</>
				}
			>
				<UnaryMetric
					lASession={lASessionFilteredByLesson}
					metric={selectedMetric as UnaryMetric}
				/>
			</SidebarEditorLayout>
		</div>
	);
}
