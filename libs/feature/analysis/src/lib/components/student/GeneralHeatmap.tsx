import React, { useMemo, useState } from "react";
import { trpc } from "@self-learning/api-client";
import { DropdownMenu } from "@self-learning/ui/common";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { HeatmapModal } from "./HeatmapModal";
import { useTranslation } from "next-i18next";

const COLORS = {
	none: "#D9D9D9",
	vlow: "#9EF7D9",
	low: "#14E8A2",
	medium: "#10B981",
	high: "#0C8A60",
	vhigh: "#085B40"
};

const addDays = (d: Date, n: number) => {
	const x = new Date(d);
	x.setDate(x.getDate() + n);
	return x;
};

const startOfISOWeek = (d: Date) => {
	const x = new Date(d);
	const day = (x.getDay() + 6) % 7;
	x.setDate(x.getDate() - day);
	x.setHours(0, 0, 0, 0);
	return x;
};

const normalizeDate = (d: Date) => {
	if (isNaN(d.getTime())) return null;
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
		d.getDate()
	).padStart(2, "0")}`;
};

// This function now uses the correct color scales for all periods
function getColor(value: number, metric: string, period: "day" | "week" | "month" | "year") {
	if (value <= 0) return COLORS.none;

	if (period === "year") {
		if (value <= 20) return COLORS.vlow;
		if (value <= 40) return COLORS.low;
		if (value <= 60) return COLORS.medium;
		if (value <= 80) return COLORS.high;
		return COLORS.vhigh; // > 80
	}

	if (period === "day" && metric === "timeMetric") {
		if (value < 0.25) return COLORS.vlow;
		if (value < 0.5) return COLORS.low;
		if (value < 0.75) return COLORS.medium;
		if (value < 1) return COLORS.high;
		return COLORS.vhigh; // >= 1
	}

	// This block correctly handles Day (Tasks), Week, and Month
	if (value <= 2) return COLORS.vlow;
	if (value <= 4) return COLORS.low;
	if (value <= 6) return COLORS.medium;
	if (value <= 8) return COLORS.high;
	return COLORS.vhigh; // > 8
}

// This function now takes 'period' as an argument to determine the correct activity scale for tooltips
function getTooltipText(
	value: number,
	label: string,
	metric: string,
	t: (key: string, opts?: any) => string,
	period: "day" | "week" | "month" | "year"
) {
	if (value <= 0) {
		if (metric === "timeMetric") return t("tooltip.noActivityTime", { label });
		if (metric === "completedTasks") return t("tooltip.noCompletedTasks", { label });
		return t("tooltip.noCorrectTasks", { label });
	}

	let activityKey = "";

	// Use the correct activity scale based on the period and metric
	if (period === "year") {
		if (value <= 20) activityKey = "tooltip.activityVeryLow";
		else if (value <= 40) activityKey = "tooltip.activityLow";
		else if (value <= 60) activityKey = "tooltip.activityMedium";
		else if (value <= 80) activityKey = "tooltip.activityHigh";
		else activityKey = "tooltip.activityVeryHigh"; // > 80
	} else if (period === "day" && metric === "timeMetric") {
		if (value < 0.25) activityKey = "tooltip.activityVeryLow";
		else if (value < 0.5) activityKey = "tooltip.activityLow";
		else if (value < 0.75) activityKey = "tooltip.activityMedium";
		else if (value < 1) activityKey = "tooltip.activityHigh";
		else activityKey = "tooltip.activityVeryHigh"; // >= 1
	} else {
		// This covers Day (Tasks), Week, and Month
		if (value <= 2) activityKey = "tooltip.activityVeryLow";
		else if (value <= 4) activityKey = "tooltip.activityLow";
		else if (value <= 6) activityKey = "tooltip.activityMedium";
		else if (value <= 8) activityKey = "tooltip.activityHigh";
		else activityKey = "tooltip.activityVeryHigh"; // > 8
	}

	if (metric === "timeMetric") {
		const minutes = Math.round(value * 60);
		const hours = Math.floor(value);
		return t("tooltip.timeActivity", {
			label,
			activity: t(activityKey),
			hours,
			minutes: minutes % 60
		});
	}

	if (metric === "completedTasks") {
		const tasks = Math.round(value);
		return t("tooltip.completedTasksActivity", {
			label,
			activity: t(activityKey),
			tasks
		});
	}

	if (metric === "correctTasks") {
		const correct = Math.round(value);
		return t("tooltip.correctTasksActivity", {
			label,
			activity: t(activityKey),
			correct
		});
	}

	return `${label}: ${t(activityKey)}`;
}

export function GeneralHeatmap() {
	// Get i18n object to access the current language
	const { t, i18n } = useTranslation("student-analytics");

	// Helper function to format date as DD.MM. (or MM/DD for en)
	// Moved inside component to access i18n.language
	const formatShortDate = (d: Date) => {
		return d.toLocaleString(i18n.language, {
			day: "2-digit",
			month: "2-digit"
		});
	};

	// Helper function to create week range labels
	// Moved inside component to access formatShortDate
	const formatWeekRange = (startDate: Date) => {
		const endDate = addDays(startDate, 6);
		return `${formatShortDate(startDate)} – ${formatShortDate(endDate)}`;
	};

	// State for current date, used to add context to the title
	const [currentDate] = useState(new Date());

	const [selected, setSelected] = useState<"timeMetric" | "completedTasks" | "correctTasks">(
		"timeMetric"
	);

	const [hover, setHover] = useState<{ x: number; y: number; text: string } | null>(null);
	const [showModal, setShowModal] = useState(false);

	const options: ("timeMetric" | "completedTasks" | "correctTasks")[] = [
		"timeMetric",
		"completedTasks",
		"correctTasks"
	];

	const { data: dailyLearning } = trpc.metrics.getStudentMetric_DailyLearningTime.useQuery();
	const { data: hourlyQuiz } = trpc.metrics.getStudentMetric_HourlyAverageQuizAnswers.useQuery();

	const groupedData = useMemo(() => {
		if (!dailyLearning && !hourlyQuiz) return null;

		const metric = selected;
		const now = currentDate; // Use the state-held date for consistency
		const nowMonth = now.getMonth();
		const nowYear = now.getFullYear();

		const dailyMap = new Map<string, number>();

		if (metric === "timeMetric" && dailyLearning) {
			for (const e of dailyLearning) {
				const iso = normalizeDate(e.day);
				if (!iso) continue;
				const seconds = typeof e.timeSeconds === "number" ? e.timeSeconds : 0;
				dailyMap.set(iso, seconds / 3600);
			}
		} else if (hourlyQuiz) {
			for (const e of hourlyQuiz) {
				const iso = normalizeDate(e.hour);
				if (!iso) continue;
				const val =
					metric === "completedTasks"
						? (e.correctAnswers ?? 0) + (e.wrongAnswers ?? 0)
						: (e.correctAnswers ?? 0);
				dailyMap.set(iso, (dailyMap.get(iso) ?? 0) + val);
			}
		}

		const todayIso = normalizeDate(now);
		const todayValue = dailyMap.get(todayIso ?? "") ?? 0;
		const day = [todayValue / 3, todayValue / 3, todayValue / 3];

		const start = startOfISOWeek(now);
		const week = Array(7).fill(0);
		for (let i = 0; i < 7; i++) {
			const iso = normalizeDate(addDays(start, i));
			week[i] = dailyMap.get(iso ?? "") ?? 0;
		}

		// Logic for month data is updated to only include weeks in the current month
		const monthData = {
			values: [] as number[],
			labels: [] as string[]
		};
		const first = new Date(nowYear, nowMonth, 1);
		let cursor = startOfISOWeek(first);

		for (let w = 0; w < 6; w++) {
			// Stop if the cursor week is no longer in the current month
			if (cursor.getMonth() !== nowMonth && cursor > first) {
				break;
			}

			let sum = 0;
			const weekStartDate = new Date(cursor);
			for (let d = 0; d < 7; d++) {
				const iso = normalizeDate(cursor);
				if (cursor.getMonth() === nowMonth) sum += dailyMap.get(iso ?? "") ?? 0;
				cursor = addDays(cursor, 1);
			}
			monthData.values.push(sum);
			monthData.labels.push(formatWeekRange(weekStartDate)); // Use date range for label
		}

		const year = Array(12).fill(0);
		for (const [key, val] of dailyMap.entries()) {
			const d = new Date(key);
			if (d.getFullYear() === nowYear) year[d.getMonth()] += val;
		}

		return { day, week, month: monthData, year };
	}, [dailyLearning, hourlyQuiz, selected, currentDate, i18n.language]); // Add i18n.language to dependency array

	const renderRow = (
		label: string,
		values: number[],
		period: "day" | "week" | "month" | "year",
		labels?: string[]
	) => (
		<div key={label} className="grid grid-cols-[70px_1fr] items-center gap-3">
			<span className="text-sm font-medium text-gray-700 text-center sm:text-left">
				{label}
			</span>
			<div className="flex gap-1.5 flex-wrap justify-start">
				{values.map((v, i) => {
					const color = getColor(v, selected, period);
					// Pass the period to getTooltipText for correct activity scale
					const text = getTooltipText(v, labels?.[i] ?? label, selected, t, period);
					return (
						<div
							key={i}
							onMouseEnter={e => {
								const rect = e.currentTarget.getBoundingClientRect();
								setHover({
									x: rect.left + rect.width / 2,
									y: rect.top - 8,
									text
								});
							}}
							onMouseLeave={() => setHover(null)}
							className="w-5 h-5 rounded-sm border border-gray-300 cursor-pointer hover:scale-110 transition-transform"
							style={{ backgroundColor: color }}
						/>
					);
				})}
			</div>
		</div>
	);

	return (
		<div
			id="StudyHeatmapsCard"
			className="relative w-full rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between"
		>
			{/* Header */}
			<div className="flex flex-col sm:flex-row items-start justify-between mb-3">
				<div>
					<h2 className="text-lg sm:text-xl font-semibold text-gray-800 text-center sm:text-left">
						{t("learningHeatmapTitle")}
					</h2>
					{/* Use i18n.language for locale-aware date formatting */}
					<p className="text-sm text-gray-500 text-center sm:text-left">
						{currentDate.toLocaleString(i18n.language, {
							dateStyle: "long"
						})}
					</p>
				</div>
				<div
					className="relative z-40 w-full sm:w-auto flex justify-center sm:justify-end pt-2 sm:pt-0"
					onClick={e => e.stopPropagation()}
				>
					{/* Dropdown logic is copied from teammate's component */}
					<DropdownMenu
						key={selected}
						title={t("selectHeatmapType")}
						button={
							<div className="flex items-center justify-between w-48 sm:w-56 rounded-md px-3 py-1.5 sm:px-4 sm:py-2 font-semibold transition-colors bg-emerald-500 text-white">
								<span className="truncate">{t(selected)}</span>
								<XMarkIcon
									className="h-4 w-4 ml-2 cursor-pointer hover:text-gray-200"
									onClick={e => {
										e.stopPropagation();
										setSelected("timeMetric");
									}}
								/>
							</div>
						}
					>
						{options.map((option, i) => (
							<span
								key={option}
								onClick={e => {
									e.stopPropagation();
									setSelected(option);
								}}
								className={`cursor-pointer block px-4 py-2 w-full sm:w-56 text-left transition-colors ${
									selected === option
										? "bg-emerald-500 text-white"
										: "hover:bg-emerald-500 hover:text-white"
								} ${
									i === 0
										? "rounded-t-md"
										: i === options.length - 1
											? "rounded-b-md"
											: ""
								}`}
							>
								{t(option)}
							</span>
						))}
					</DropdownMenu>
				</div>
			</div>

			{/* Heatmap */}
			<div className="rounded-lg border border-emerald-300 bg-gray-50 px-6 py-5 flex flex-col justify-between">
				{groupedData ? (
					<>
						<div className="flex flex-col justify-between gap-4">
							{/* Use clearer labels for "Today" row */}
							{renderRow(t("today"), groupedData.day, "day", [
								t("Früh"), // Needs "Früh": "Früh" in JSON
								t("Tag"), // Needs "Tag": "Tag" in JSON
								t("Spät") // Needs "Spät": "Spät" in JSON
							])}
							{/* Use full day names for "Week" row tooltips */}
							{renderRow(t("week"), groupedData.week, "week", [
								t("monFull"),
								t("tueFull"),
								t("wedFull"),
								t("thuFull"),
								t("friFull"),
								t("satFull"),
								t("sunFull")
							])}
							{/* Use dynamic date ranges for "Month" row labels */}
							{renderRow(
								t("month"),
								groupedData.month.values,
								"month",
								groupedData.month.labels
							)}
							{/* Use full month names for "Year" row tooltips */}
							{renderRow(t("year"), groupedData.year, "year", [
								t("janFull"), // Needs "janFull": "Januar" in JSON
								t("febFull"), // Needs "febFull": "Februar" in JSON
								t("marFull"), // ...
								t("aprFull"),
								t("mayFull"),
								t("junFull"),
								t("julFull"),
								t("augFull"),
								t("sepFull"),
								t("octFull"),
								t("novFull"),
								t("decFull") // Needs "decFull": "Dezember" in JSON
							])}
						</div>

						<p
							onClick={() => setShowModal(true)}
							id="open-detailed-heatmaps"
							className="text-sm text-center text-emerald-600 cursor-pointer mt-4"
						>
							{t("openDetailedHeatmaps")}
							<span className="text-emerald-600 text-base"> →</span>
						</p>
					</>
				) : (
					<p className="text-gray-400 text-center py-2 text-sm sm:text-base">
						{t("selectHeatmapPrompt")}
					</p>
				)}
			</div>

			{/* Legend */}
			<div className="flex flex-wrap gap-2 items-center mt-3 justify-center sm:justify-start">
				<span className="text-sm font-semibold text-gray-700 mr-2">{t("activity")}:</span>
				{Object.entries(COLORS).map(([key, color]) => {
					// The labelMap now uses the t() function for translations
					const labelMap: Record<string, string> = {
						none: t("noActivity"),
						vlow: t("veryLow"),
						low: t("low"),
						medium: t("medium"),
						high: t("high"),
						vhigh: t("veryHigh")
					};
					return (
						<div key={key} className="flex items-center gap-1">
							<span
								className="inline-block w-4 h-4 rounded-full border border-gray-300"
								style={{ backgroundColor: color }}
							></span>
							<span className="text-sm text-gray-700">{labelMap[key]}</span>
						</div>
					);
				})}
			</div>

			{hover && (
				<div
					className="fixed z-50 bg-gray-900 text-white text-xs px-3 py-2 rounded-md shadow-lg max-w-[220px]"
					style={{
						top: hover.y,
						left: hover.x,
						transform: "translate(-50%, -100%)"
					}}
				>
					{hover.text}
				</div>
			)}

			{showModal && (
				//<HeatmapModal selectedMetric={t(selected)} onClose={() => setShowModal(false)} />
				<HeatmapModal onClose={() => setShowModal(false)} />
			)}
		</div>
	);
}
