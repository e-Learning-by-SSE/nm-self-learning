import { LearningAnalyticsType } from "@self-learning/api";
import { SidebarEditorLayout } from "@self-learning/ui/layouts";
import Select from "react-select";
import { LabeledField } from "@self-learning/ui/forms";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CalendarDaysIcon } from "@heroicons/react/24/solid";

import { Divider } from "@self-learning/ui/common";
import { UNARY_METRICS, UnaryMetric, notNull } from "../..";
import { useEffect, useState } from "react";
import { format } from "date-fns";

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
	if (value !== "Alle")
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

/**
 * Responsive design for the metric selection.
 * @param selectedMetric The current metric selection
 * @param setSelectedMetric The function to set the metric selection
 * @returns The metric selection component (dropdown on smaller devices, buttons on larger devices)
 */
function MetricSelector({
	selectedMetric,
	setSelectedMetric,
	screenSize
}: {
	screenSize: number;
	selectedMetric: string;
	setSelectedMetric: (metric: string) => void;
}) {
	// Detection of Screen Size
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		function handleResize() {
			setIsMobile(window.innerWidth < screenSize);
		}

		window.addEventListener("resize", handleResize);
		handleResize();

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, [screenSize]);

	// DropDown metric selection on smaller devices / window
	if (isMobile) {
		const values = Object.keys(UNARY_METRICS).map(metric => ({
			value: metric,
			label: UNARY_METRICS[metric as UnaryMetric]
		}));
		const defaultValue = values.findIndex(value => value.value === selectedMetric);

		return (
			<>
				<p className="heading text-2xl">Metriken</p>
				<Select
					id={"metricSelection"}
					instanceId={"metricSelection"}
					isSearchable={true}
					defaultValue={values[defaultValue]}
					onChange={e => {
						setSelectedMetric(e?.value as UnaryMetric);
					}}
					options={values}
				/>
			</>
		);
	}

	// Default (if screen is wide enough): List of buttons for metric selection
	return (
		<>
			<p className="heading text-2xl">Metriken</p>
			{Object.keys(UNARY_METRICS).map(metric => (
				<button
					key={metric}
					onClick={() => setSelectedMetric(metric)}
					className={`p-2 hover:text-gray-500 ${
						metric === selectedMetric ? "text-secondary" : ""
					}`}
				>
					<p className="... text-left">{UNARY_METRICS[metric as UnaryMetric]}</p>
				</button>
			))}
		</>
	);
}

/**
 * Unary view of the learning analytics dashboard.
 * - This view provides only unary metrics, i.e., no combination or regression analysis.
 * - The view provides filtering for: course, lesson, and time.
 * @param lASession The learning analytics session data to display
 * @returns A component to display the unary learning analytics dashboard
 */
export function UnaryLearningAnalyticsDashboard({
	lASession
}: {
	lASession: LearningAnalyticsType;
}) {
	const [selectedCourse, setSelectedCourse] = useState("Alle");
	const [selectedLesson, setSelectedLesson] = useState("Alle");

	// Selection of optional first and last date for the time filter
	const startTimes = lASession.map(item => new Date(item.start).getTime());
	const firstDate = Math.min(...startTimes);
	const lastDate = Math.max(...startTimes);
	const [startDate, setStartDate] = useState<Date | null>(new Date(firstDate));
	const [endDate, setEndDate] = useState<Date | null>(new Date(lastDate));

	const lASessionFilterByTime = filterSessionByDate(lASession, startDate, endDate);
	const lASessionFilteredByCourse = JSON.parse(JSON.stringify(lASessionFilterByTime));
	filterLaSession(lASessionFilteredByCourse, selectedCourse, "course");
	const lASessionFilteredByLesson = JSON.parse(JSON.stringify(lASessionFilteredByCourse));
	filterLaSession(lASessionFilteredByLesson, selectedLesson, "lesson");

	const [selectedMetric, setSelectedMetric] = useState(Object.keys(UNARY_METRICS)[0]);

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
						{/* TODO SE: When does the layout change? Currently, this happens at 1280, but do we have a variable for this? */}
						<MetricSelector
							screenSize={1280}
							selectedMetric={selectedMetric}
							setSelectedMetric={setSelectedMetric}
						/>
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
