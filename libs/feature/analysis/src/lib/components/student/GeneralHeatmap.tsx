"use client";

import React, { useMemo, useState } from "react";
import { trpc } from "@self-learning/api-client";
import { DropdownMenu } from "@self-learning/ui/common";
import { ChevronDownIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { HeatmapModal } from "./HeatmapModal";

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

const normalizeDate = (dateInput: any) => {
	if (!dateInput) return null;
	const d = new Date(dateInput);
	if (isNaN(d.getTime())) return null;
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
		d.getDate()
	).padStart(2, "0")}`;
};

function getColor(value: number, metric: string, period: "day" | "week" | "month" | "year") {
	if (value <= 0) return COLORS.none;

	if (period === "year") {
		if (value <= 20) return COLORS.vlow;
		if (value <= 40) return COLORS.low;
		if (value <= 60) return COLORS.medium;
		if (value <= 80) return COLORS.high;
		return COLORS.vhigh;
	}

	if (period === "day" && metric === "Zeit") {
		if (value < 0.25) return COLORS.vlow;
		if (value < 0.5) return COLORS.low;
		if (value < 0.75) return COLORS.medium;
		if (value < 1) return COLORS.high;
		return COLORS.vhigh;
	}

	if (value <= 2) return COLORS.vlow;
	if (value <= 4) return COLORS.low;
	if (value <= 6) return COLORS.medium;
	if (value <= 8) return COLORS.high;
	return COLORS.vhigh;
}

function getTooltipText(value: number, label: string, metric: string) {
	if (value <= 0) {
		if (metric === "Zeit") return `${label}: Keine Aktivität`;
		if (metric === "Abgeschlossene Aufgaben") return `${label}: Keine Aufgaben erledigt`;
		return `${label}: Keine richtigen Antworten`;
	}

	let activity = "";
	if (value <= 2) activity = "Sehr geringe Aktivität";
	else if (value <= 4) activity = "Geringe Aktivität";
	else if (value <= 6) activity = "Mittlere Aktivität";
	else if (value <= 8) activity = "Hohe Aktivität";
	else activity = "Sehr hohe Aktivität";

	if (metric === "Zeit") {
		const minutes = Math.round(value * 60);
		const hours = Math.floor(value);
		const timeStr = hours > 0 ? `${hours} Std. ${minutes % 60} Min.` : `${minutes} Min.`;
		return `${label}: ${activity}. Du hast ${timeStr} gelernt.`;
	}

	if (metric === "Abgeschlossene Aufgaben") {
		const tasks = Math.round(value);
		return `${label}: ${activity}. Du hast ${tasks} Aufgaben erledigt.`;
	}

	if (metric === "Richtige Aufgaben") {
		const correct = Math.round(value);
		return `${label}: ${activity}. Du hast ${correct} Aufgaben richtig gelöst.`;
	}

	return `${label}: ${activity}`;
}

export function GeneralHeatmap() {
	const [selected, setSelected] = useState<string | null>("Zeit");
	const [hover, setHover] = useState<{ x: number; y: number; text: string } | null>(null);
	const [showModal, setShowModal] = useState(false);

	const options = ["Zeit", "Abgeschlossene Aufgaben", "Richtige Aufgaben"];

	const { data: dailyLearning } = trpc.metrics.getStudentMetric_DailyLearningTime.useQuery();
	const { data: hourlyQuiz } = trpc.metrics.getStudentMetric_HourlyAverageQuizAnswers.useQuery();

	const groupedData = useMemo(() => {
		if (!dailyLearning && !hourlyQuiz) return null;

		const metric = selected ?? "Zeit";
		const now = new Date();
		const nowMonth = now.getMonth();
		const nowYear = now.getFullYear();

		const dailyMap = new Map<string, number>();

		if (metric === "Zeit" && dailyLearning) {
			for (const e of dailyLearning as any[]) {
				const iso = normalizeDate(e.day ?? (e as any).date);
				if (!iso) continue;
				const seconds =
					typeof e.timeSeconds === "number"
						? e.timeSeconds
						: typeof (e as any).seconds === "number"
							? (e as any).seconds
							: 0;
				dailyMap.set(iso, seconds / 3600);
			}
		} else if (hourlyQuiz) {
			for (const e of hourlyQuiz as any[]) {
				const iso = normalizeDate(e.hour);
				if (!iso) continue;
				const val =
					metric === "Abgeschlossene Aufgaben"
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

		const first = new Date(nowYear, nowMonth, 1);
		const startMonth = startOfISOWeek(first);
		const month = Array(6).fill(0);
		let cursor = new Date(startMonth);

		for (let w = 0; w < 6; w++) {
			let sum = 0;
			for (let d = 0; d < 7; d++) {
				const iso = normalizeDate(cursor);
				if (cursor.getMonth() === nowMonth) sum += dailyMap.get(iso ?? "") ?? 0;
				cursor = addDays(cursor, 1);
			}
			month[w] = sum;
		}

		const year = Array(12).fill(0);
		for (const [key, val] of dailyMap.entries()) {
			const d = new Date(key);
			if (d.getFullYear() === nowYear) year[d.getMonth()] += val;
		}

		return { day, week, month, year };
	}, [dailyLearning, hourlyQuiz, selected]);

	const renderRow = (
		label: string,
		values: number[],
		period: "day" | "week" | "month" | "year",
		labels?: string[]
	) => {
		const metric = selected ?? "Zeit";
		return (
			<div key={label} className="grid grid-cols-[70px_1fr] items-center gap-3">
				<span className="text-sm font-medium text-gray-700 text-center sm:text-left">
					{label}
				</span>
				<div className="flex gap-1.5 flex-wrap justify-start">
					{values.map((v, i) => {
						const color = getColor(v, metric, period);
						const text = getTooltipText(v, labels?.[i] ?? label, metric);
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
	};

	return (
		<div className="relative w-full rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between">
			{/* Header */}
			<div className="flex flex-col sm:flex-row items-center justify-between mb-3">
				<h2 className="text-lg sm:text-xl font-semibold text-gray-800 text-center sm:text-left">
					Lern-Heatmaps
				</h2>
				<div
					className="relative z-40 w-full sm:w-auto flex justify-center sm:justify-end"
					onClick={e => e.stopPropagation()}
				>
					<DropdownMenu
						key={selected ?? "default"}
						title="Heatmap-Typ auswählen"
						button={
							<div
								className={`flex items-center justify-between w-48 sm:w-56 rounded-md px-3 py-1.5 sm:px-4 sm:py-2 font-semibold transition-colors ${
									selected
										? "bg-emerald-500 text-white"
										: "border border-gray-300 bg-white text-gray-700"
								}`}
							>
								<span className="truncate">{selected || "Auswählen..."}</span>
								{selected ? (
									<XMarkIcon
										className="h-4 w-4 ml-2 cursor-pointer hover:text-gray-200"
										onClick={e => {
											e.stopPropagation();
											setSelected(null);
										}}
									/>
								) : (
									<ChevronDownIcon className="h-4 w-4 ml-2 text-gray-500" />
								)}
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
								{option}
							</span>
						))}
					</DropdownMenu>
				</div>
			</div>

			{/* Heatmap */}
			<div className="rounded-lg border border-emerald-300 bg-gray-50 px-6 py-5 flex flex-col justify-between">
				{groupedData ? (
					<>
						{/* evenly spaced rows */}
						<div className="flex flex-col justify-between gap-4">
							{renderRow("Heute", groupedData.day, "day", ["Morgen", "Tag", "Abend"])}
							{renderRow("Woche", groupedData.week, "week", [
								"Mo",
								"Di",
								"Mi",
								"Do",
								"Fr",
								"Sa",
								"So"
							])}
							{renderRow("Monat", groupedData.month, "month", [
								"W1",
								"W2",
								"W3",
								"W4",
								"W5",
								"W6"
							])}
							{renderRow("Jahr", groupedData.year, "year", [
								"Jan",
								"Feb",
								"Mrz",
								"Apr",
								"Mai",
								"Jun",
								"Jul",
								"Aug",
								"Sep",
								"Okt",
								"Nov",
								"Dez"
							])}
						</div>

						{/* perfectly balanced link placement */}
						<p
							onClick={() => setShowModal(true)}
							className="text-sm text-center text-emerald-600 cursor-pointer hover:underline mt-4"
						>
							Zu den detaillierten Lern-Heatmaps wechseln →
						</p>
					</>
				) : (
					<p className="text-gray-400 text-center py-2 text-sm sm:text-base">
						Wähle einen Heatmap-Typ aus, um Daten anzuzeigen
					</p>
				)}
			</div>

			{/* Legend */}
			<div className="flex flex-wrap gap-2 items-center mt-3 justify-center sm:justify-start">
				<span className="text-sm font-semibold text-gray-700 mr-2">
					Aktivitäts-Legende:
				</span>
				{Object.entries(COLORS).map(([key, color]) => {
					const labelMap: Record<string, string> = {
						none: "Keine Aktivität",
						vlow: "Sehr gering",
						low: "Gering",
						medium: "Mittel",
						high: "Hoch",
						vhigh: "Sehr hoch"
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
				<HeatmapModal
					selectedMetric={selected ?? "Zeit"}
					onClose={() => setShowModal(false)}
				/>
			)}
		</div>
	);
}
