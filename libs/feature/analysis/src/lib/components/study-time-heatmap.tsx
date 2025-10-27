"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { trpc } from "@self-learning/api-client";

/** ---------- TYPES ---------- */
export type Period = "day" | "week" | "month" | "year";
export type Metric = "hours" | "units" | "accuracy";

/** ---------- COLORS ---------- */
const COLORS = [
	"#D9D9D9", // no activity (exactly 0)
	"#9EF7D9", // 0–2 very low activity
	"#14E8A2", // >2–4 low activity
	"#10B981", // >4–6 middle activity
	"#0C8A60", // >6–8 high activity
	"#085B40" // >8 very high activity
];
const DARK_GREEN_SET = new Set(["#085B40", "#0C8A60"]);
const textColorFor = (hex: string) => (DARK_GREEN_SET.has(hex) ? "#FFFFFF" : "#000000");

/** ---------- DATE HELPERS ---------- */
export const addDays = (d: Date, n: number) => {
	const x = new Date(d);
	x.setDate(x.getDate() + n);
	return x;
};

export const startOfISOWeek = (d: Date) => {
	const x = new Date(d);
	const day = (x.getDay() + 6) % 7; // Monday = 0
	x.setDate(x.getDate() - day);
	x.setHours(0, 0, 0, 0);
	return x;
};

/** ---------- DATE NORMALIZER ---------- */
function normalizeDate(dateInput: any): string | null {
	if (!dateInput) return null;
	if (typeof dateInput === "string" && /^\d{4}-\d{2}-\d{2}/.test(dateInput)) {
		return dateInput.slice(0, 10);
	}
	if (typeof dateInput === "string" && dateInput.includes("T")) {
		const d = new Date(dateInput);
		if (!isNaN(d.getTime())) {
			return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
				d.getDate()
			).padStart(2, "0")}`;
		}
	}
	if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
		return `${dateInput.getFullYear()}-${String(dateInput.getMonth() + 1).padStart(
			2,
			"0"
		)}-${String(dateInput.getDate()).padStart(2, "0")}`;
	}
	return null;
}

/** ---------- UTC DATE PARSER ---------- */
function parseUTC(dateString: string | Date): Date {
	if (dateString instanceof Date) return dateString;

	// If only date without time (e.g. "2025-10-27")
	if (typeof dateString === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
		const [y, m, d] = dateString.split("-").map(Number);
		return new Date(Date.UTC(y, m - 1, d));
	}

	// Example: "2025-10-27T12:00:00.000Z"
	const d = new Date(dateString);
	return new Date(
		Date.UTC(
			d.getUTCFullYear(),
			d.getUTCMonth(),
			d.getUTCDate(),
			d.getUTCHours(),
			d.getUTCMinutes(),
			d.getUTCSeconds()
		)
	);
}

/** ---------- METRIC NORMALIZER ---------- */
function normalizeMetric(m: string): Metric {
	const s = (m || "").toLowerCase();
	if (s === "zeit" || s === "hours") return "hours";
	if (s === "alle aufgaben" || s === "units") return "units";
	if (s === "richtige aufgaben" || s === "accuracy") return "accuracy";
	return "hours";
}

/** ---------- COLOR SCALE (ABSOLUTE THRESHOLDS) ---------- */
const colorFor = (v: number) => {
	if (v === 0) return COLORS[0];
	if (v <= 2) return COLORS[1];
	if (v <= 4) return COLORS[2];
	if (v <= 6) return COLORS[3];
	if (v <= 8) return COLORS[4];
	return COLORS[5];
};

/** ---------- COLOR SCALE (ADAPTIVE ONLY FOR TIME/Day) ---------- */
const colorForValue = (v: number, period: Period, metric: Metric) => {
	if (v <= 0) return COLORS[0];

	// Different scale for annual view
	if (period === "year") {
		if (v <= 20) return COLORS[1];
		if (v <= 40) return COLORS[2];
		if (v <= 60) return COLORS[3];
		if (v <= 80) return COLORS[4];
		return COLORS[5];
	}

	// Scale for hours in the daily view
	if (period === "day" && metric === "hours") {
		if (v < 0.25) return COLORS[1];
		if (v < 0.5) return COLORS[2];
		if (v < 0.75) return COLORS[3];
		if (v < 1) return COLORS[4];
		return COLORS[5];
	}

	// All other views (weeks/month, etc.)
	if (v <= 2) return COLORS[1];
	if (v <= 4) return COLORS[2];
	if (v <= 6) return COLORS[3];
	if (v <= 8) return COLORS[4];
	return COLORS[5];
};

/** Help functions for quiz aggregation (units / accuracy) */
type HourlyQuiz = {
	hour: Date | string;
	wrongAnswers: number;
	correctAnswers: number;
	averageAccuracyRate: number;
};

function aggregateQuizByDay(hourlyQuiz: HourlyQuiz[], metric: Metric): Map<string, number> {
	const map = new Map<string, number>();
	for (const q of hourlyQuiz) {
		const d = parseUTC(q.hour as any);
		const key = normalizeDate(d)!;
		const val =
			metric === "units"
				? (q.wrongAnswers ?? 0) + (q.correctAnswers ?? 0)
				: (q.correctAnswers ?? 0); // accuracy = Anzahl richtiger Aufgaben
		map.set(key, (map.get(key) ?? 0) + val);
	}
	return map;
}

function aggregateQuizByWeekBuckets(
	hourlyQuiz: HourlyQuiz[],
	startOfWeek: Date,
	metric: Metric
): number[][] {
	// 3 rows (early/day/late) × 7 columns (Mon–Sun)
	const values: number[][] = Array.from({ length: 3 }, () => Array.from({ length: 7 }, () => 0));
	const end = addDays(startOfWeek, 7);

	for (const q of hourlyQuiz) {
		const dh = parseUTC(q.hour as any);
		if (dh < startOfWeek || dh >= end) continue;

		const dayIndex = Math.floor((dh.getTime() - startOfWeek.getTime()) / (1000 * 60 * 60 * 24));
		const hour = dh.getUTCHours();

		let r = 0;
		if (hour >= 0 && hour < 8)
			r = 0; // early 0:00-7:59
		else if (hour >= 8 && hour < 16)
			r = 1; // day 8:00-15:59
		else r = 2; // late 16:00-23:59

		const add =
			metric === "units"
				? (q.wrongAnswers ?? 0) + (q.correctAnswers ?? 0)
				: (q.correctAnswers ?? 0);
		values[r][dayIndex] += add;
	}
	return values;
}

/** ---------- MAIN COMPONENT ---------- */
export default function StudyTimeHeatmap({
	period,
	metric,
	selection,
	heightPx = 230
}: {
	period: Period;
	metric: Metric | string;
	selection: Date;
	heightPx?: number;
}) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	// Queries separated by source
	const dailyLearningQuery = trpc.metrics.getStudentMetric_DailyLearningTime.useQuery();
	const hourlyLearningQuery = trpc.metrics.getStudentMetric_HourlyLearningTime.useQuery();
	const hourlyQuizQuery = trpc.metrics.getStudentMetric_HourlyAverageQuizAnswers.useQuery();

	const internalMetric: Metric = normalizeMetric(String(metric));
	const isLoading =
		dailyLearningQuery.isLoading || hourlyLearningQuery.isLoading || hourlyQuizQuery.isLoading;

	const dailyLearning = dailyLearningQuery.data ?? null; // for "Zeit"/time (Monat/Jahr)
	const hourlyLearning = hourlyLearningQuery.data ?? null; // for "Zeit"/time (Day/Week)
	const hourlyQuiz = (hourlyQuizQuery.data ?? null) as any[] | null; // for "Erledigte Aufgaben" & "Richtige Aufgaben"/Units/Accuracy

	// visibility
	const hasNoData = useMemo(() => {
		if (internalMetric === "hours") {
			if (period === "day" || period === "week")
				return !hourlyLearning || hourlyLearning.length === 0;
			return !dailyLearning || (Array.isArray(dailyLearning) && dailyLearning.length === 0);
		} else {
			// "Erledigte Aufgaben" & "Richtige Aufgaben"/Units/Accuracy always come from hourlyQuiz (for aggregation)
			return !hourlyQuiz || hourlyQuiz.length === 0;
		}
	}, [period, internalMetric, dailyLearning, hourlyLearning, hourlyQuiz]);

	/** ---------- CONFIG (PURE DATA → MATRIX MODEL) ---------- */
	const config = useMemo(() => {
		const sel = parseUTC(selection);
		const nowMonth = sel.getMonth();
		const nowYear = sel.getFullYear();

		/** ---- DAILY MAP (only needed for Month/Year) ---- */
		let dailyMap = new Map<string, number>();
		if (internalMetric === "hours") {
			// from DailyLearningTime (seconds → hours)
			if (dailyLearning) {
				for (const entry of dailyLearning as any[]) {
					const iso = normalizeDate(entry.day ?? entry.date);
					if (!iso) continue;
					const value = (entry.timeSeconds ?? entry.seconds ?? 0) / 3600;
					dailyMap.set(iso, value);
				}
			}
		} else {
			// "Erledigte Aufgaben" & "Richtige Aufgaben"/Units/Accuracy from hourly quiz data aggregate into days
			if (hourlyQuiz) {
				dailyMap = aggregateQuizByDay(hourlyQuiz as HourlyQuiz[], internalMetric);
			}
		}

		/** ---- DAY ---- */
		if (period === "day") {
			const rows = ["", "", ""];
			const cols = Array.from({ length: 8 }, (_, i) => i);
			const isoToday = normalizeDate(sel);

			let hoursForDay: { hour: number; value: number }[] = [];

			if (internalMetric === "hours") {
				// Hours of learning time
				hoursForDay = Array.isArray(hourlyLearning)
					? hourlyLearning
							.filter((h: any) => normalizeDate(h.hour) === isoToday)
							.map((h: any) => {
								const d = parseUTC(h.hour);
								const local = new Date(h.hour);
								console.log(
									"🧭 RAW:",
									h.hour,
									"| Parsed (UTC):",
									d.toISOString(),
									"| Local:",
									local.toISOString()
								);
								return {
									hour: d.getUTCHours(),
									value: (h.timeSeconds ?? 0) / 3600
								};
							})
					: [];
			} else {
				// "Erledigte Aufgaben" & "Richtige Aufgaben"/Units/Accuracy from hourly quiz data
				const hourlySumMap = new Map<number, number>();
				if (Array.isArray(hourlyQuiz)) {
					for (const h of hourlyQuiz as HourlyQuiz[]) {
						if (normalizeDate(h.hour) !== isoToday) continue;
						const d = parseUTC(h.hour as any);
						const local = new Date(h.hour as any);
						console.log(
							"🧭 QUIZ RAW:",
							h.hour,
							"| Parsed (UTC):",
							d.toISOString(),
							"| Local:",
							local.toISOString()
						);
						const hour = d.getUTCHours();
						const val =
							internalMetric === "units"
								? (h.wrongAnswers ?? 0) + (h.correctAnswers ?? 0)
								: (h.correctAnswers ?? 0);
						hourlySumMap.set(hour, (hourlySumMap.get(hour) ?? 0) + val);
					}
				}
				hoursForDay = Array.from(hourlySumMap.entries()).map(([hour, value]) => ({
					hour,
					value
				}));
			}

			const matrix: number[][] = rows.map(() => cols.map(() => 0));
			for (const { hour, value } of hoursForDay) {
				const r = Math.floor(hour / 8);
				const c = hour % 8;
				if (r >= 0 && r < 3 && c >= 0 && c < 8) matrix[r][c] = value;
			}
			const cellLabel = (r: number, c: number) => `${r * 8 + c}`;
			return { rows, cols, values: matrix, xLabels: [], yLabels: rows, cellLabel };
		}

		/** ---- WEEK ---- */
		if (period === "week") {
			const rows = ["Früh", "Tag", "Spät"];
			const cols = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
			const start = startOfISOWeek(sel);

			let values: number[][] = rows.map(() => cols.map(() => 0));

			if (internalMetric === "hours") {
				// Aggregation from hourly learning time
				const end = addDays(start, 7);
				const weekHours = (Array.isArray(hourlyLearning) ? hourlyLearning : []).filter(
					(h: any) => {
						const d = parseUTC(h.hour);
						return d >= start && d < end;
					}
				);

				for (const h of weekHours) {
					const d = parseUTC(h.hour);
					const dayIndex = Math.floor(
						(d.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
					);
					const hour = d.getUTCHours();
					const add = (h.timeSeconds ?? 0) / 3600;
					let r = 0;
					if (hour >= 0 && hour < 8) r = 0;
					else if (hour >= 8 && hour < 16) r = 1;
					else r = 2;
					values[r][dayIndex] += add;
				}
			} else {
				// Aggregation from hourly quiz data
				values = aggregateQuizByWeekBuckets(
					(hourlyQuiz ?? []) as HourlyQuiz[],
					start,
					internalMetric
				);
			}

			return { rows, cols, values, xLabels: cols, yLabels: rows, cellLabel: () => "" };
		}

		/** ---- MONTH ---- */
		if (period === "month") {
			const firstOfMonth = new Date(nowYear, nowMonth, 1);
			const start = startOfISOWeek(firstOfMonth);
			const cols = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
			const values: number[][] = [];
			const labels: string[][] = [];

			let cursor = new Date(start);
			for (let w = 0; w < 6; w++) {
				const rowVals: number[] = [];
				const rowLabs: string[] = [];
				for (let d = 0; d < 7; d++) {
					const isoDate = normalizeDate(cursor);
					const inMonth = cursor.getMonth() === nowMonth;
					const val = inMonth ? (dailyMap.get(isoDate ?? "") ?? 0) : -1;
					rowVals.push(val);
					rowLabs.push(inMonth ? String(cursor.getDate()) : "");
					cursor = addDays(cursor, 1);
				}
				values.push(rowVals);
				labels.push(rowLabs);
			}

			return {
				rows: new Array(6).fill(""),
				cols,
				values,
				xLabels: cols,
				yLabels: [],
				cellLabel: (r: number, c: number) => labels[r][c]
			};
		}

		/** ---- YEAR ---- */
		const months = [
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
		];
		const rows = ["", "", ""];
		const cols = ["", "", "", ""];
		const values: number[][] = [];
		const labels: string[][] = [];

		let m = 0;
		for (let r = 0; r < 3; r++) {
			const rowVals: number[] = [];
			const rowLabs: string[] = [];
			for (let c = 0; c < 4; c++) {
				const monthIndex = m++;
				// Total of all days this month from dailyMap
				const sum = Array.from(dailyMap.entries()).reduce((acc, [key, v]) => {
					const d = parseUTC(key);
					return d.getMonth() === monthIndex && d.getFullYear() === nowYear
						? acc + v
						: acc;
				}, 0);
				rowVals.push(sum);
				rowLabs.push(months[monthIndex] ?? "");
			}
			values.push(rowVals);
			labels.push(rowLabs);
		}

		return { rows, cols, values, xLabels: [], yLabels: [], cellLabel: (r, c) => labels[r][c] };
	}, [period, selection, dailyLearning, hourlyLearning, hourlyQuiz, internalMetric]);

	/** ---------- CHART RENDERING ---------- */
	useEffect(() => {
		if (typeof window === "undefined" || hasNoData) return;
		let chartInstance: any = null;

		(async () => {
			const ChartModule = await import("chart.js/auto");
			const { Chart } = ChartModule;
			const MatrixModule = await import("chartjs-chart-matrix");
			const { MatrixController, MatrixElement } = MatrixModule as any;
			Chart.register(MatrixController, MatrixElement);

			const ctx = canvasRef.current;
			if (!ctx) return;
			if ((ctx as any)._chartInstance) (ctx as any)._chartInstance.destroy();

			const rows = (config as any).rows.length;
			const cols = (config as any).cols.length;
			const data = [];
			for (let r = 0; r < rows; r++)
				for (let c = 0; c < cols; c++)
					data.push({ x: c, y: r, v: (config as any).values[r][c] });

			const gapX =
				period === "year" ? 22 : period === "month" ? 10 : period === "week" ? 10 : 8;
			const gapY =
				period === "year" ? 14 : period === "month" ? 8 : period === "week" ? 12 : 8;

			const labelPlugin = {
				id: "cellLabels",
				afterDatasetsDraw: (chart: any) => {
					const { ctx } = chart;
					const meta = chart.getDatasetMeta(0);
					const elements = meta?.data ?? [];
					ctx.save();
					ctx.textAlign = "center";
					ctx.textBaseline = "middle";
					for (const el of elements) {
						const { x, y } = el.tooltipPosition();
						const raw = el.$context.raw as { x: number; y: number; v: number };
						const label = (config as any).cellLabel(raw.y, raw.x);
						if (!label) continue;
						const bg =
							raw.v === -1
								? "rgba(0,0,0,0.7)"
								: colorForValue(raw.v, period, internalMetric);
						ctx.fillStyle = raw.v === -1 ? "rgba(255,255,255,0.85)" : textColorFor(bg);
						const w = el.width ?? 16;
						const h = el.height ?? 16;
						const cellEdge = Math.min(w, h);
						const fontSize = Math.max(10, Math.min(14, Math.floor(cellEdge * 0.48)));
						ctx.font = `${fontSize}px Inter, system-ui, sans-serif`;
						ctx.fillText(label, x, y);
					}
					ctx.restore();
				}
			};

			const newChart = new Chart(ctx, {
				type: "matrix",
				data: {
					datasets: [
						{
							data,
							backgroundColor: (c: any) =>
								c.raw.v === -1
									? "rgba(0,0,0,0.7)"
									: colorForValue(c.raw.v, period, internalMetric),
							borderRadius: 6,
							width: (c: any) => (c.chart.chartArea?.width ?? 0) / cols - gapX,
							height: (c: any) => (c.chart.chartArea?.height ?? 0) / rows - gapY
						}
					]
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					animation: false,
					layout: { padding: { top: 8, right: 8, bottom: 8, left: 8 } },

					plugins: {
						legend: { display: false },
						tooltip: {
							enabled: true,
							backgroundColor: "rgba(17, 24, 39, 0.85)",
							displayColors: false,
							callbacks: {
								title: () => "",
								label: (ctx: any) => {
									const v: number = ctx.raw.v;
									if (v === -1) return "Außerhalb des aktuellen Monats";
									if (v === 0) {
										if (internalMetric === "hours") return "Keine Aktivität";
										if (internalMetric === "units")
											return "Keine Aufgaben erledigt";
										if (internalMetric === "accuracy")
											return "Keine richtigen Antworten";
									}

									const currentDate = new Date(selection);

									let text = "";

									/** ---------- DAY ---------- */
									if (period === "day") {
										if (internalMetric === "hours") {
											const minutes = Math.round(v * 60);
											let activityLabel = "";
											if (v <= 0) activityLabel = "Keine Aktivität";
											else if (v < 0.25)
												activityLabel = "Sehr geringe Aktivität";
											else if (v < 0.5) activityLabel = "Geringe Aktivität";
											else if (v < 0.75) activityLabel = "Mittlere Aktivität";
											else if (v < 1) activityLabel = "Hohe Aktivität";
											else activityLabel = "Sehr hohe Aktivität";
											text =
												v <= 0
													? activityLabel
													: `${activityLabel}, du hast ${minutes} Minuten gelernt.`;
										} else if (internalMetric === "units") {
											const tasks = Math.round(v);
											let activityLabel = "";
											if (v <= 2) activityLabel = "Sehr geringe Aktivität";
											else if (v <= 4) activityLabel = "Geringe Aktivität";
											else if (v <= 6) activityLabel = "Mittlere Aktivität";
											else if (v <= 8) activityLabel = "Hohe Aktivität";
											else activityLabel = "Sehr hohe Aktivität";
											text =
												tasks === 1
													? `${activityLabel}, du hast 1 Aufgabe erledigt.`
													: `${activityLabel}, du hast ${tasks} Aufgaben erledigt.`;
										} else {
											const correct = Math.round(v);
											let activityLabel = "";
											if (v <= 2) activityLabel = "Sehr geringe Aktivität";
											else if (v <= 4) activityLabel = "Geringe Aktivität";
											else if (v <= 6) activityLabel = "Mittlere Aktivität";
											else if (v <= 8) activityLabel = "Hohe Aktivität";
											else activityLabel = "Sehr hohe Aktivität";
											text =
												correct === 1
													? `${activityLabel}, du hast 1 Aufgabe richtig gelöst.`
													: `${activityLabel}, du hast ${correct} Aufgaben richtig gelöst.`;
										}
									} else if (period === "week") {

									/** ---------- WEEK ---------- */
										const tag = [
											"Montag",
											"Dienstag",
											"Mittwoch",
											"Donnerstag",
											"Freitag",
											"Samstag",
											"Sonntag"
										][ctx.raw.x];
										const tageszeit = ["Am Vormittag", "Tagsüber", "Am Abend"][
											ctx.raw.y
										];

										let activityLabel = "";
										if (v <= 2) activityLabel = "Sehr geringe Aktivität";
										else if (v <= 4) activityLabel = "Geringe Aktivität";
										else if (v <= 6) activityLabel = "Mittlere Aktivität";
										else if (v <= 8) activityLabel = "Hohe Aktivität";
										else activityLabel = "Sehr hohe Aktivität";

										const hours = Math.floor(v);
										const minutes = Math.round((v - hours) * 60);
										const timeStr =
											hours > 0
												? `${hours} Std. ${minutes > 0 ? minutes + " Min." : ""}`.trim()
												: `${minutes} Min.`;

										if (internalMetric === "hours") {
											text = `${activityLabel} am ${tag}. ${tageszeit} hast du ${timeStr} gelernt.`;
										} else if (internalMetric === "units") {
											text = `${activityLabel} am ${tag}. ${tageszeit} hast du ${v} Aufgaben erledigt.`;
										} else {
											text = `${activityLabel} am ${tag}. ${tageszeit} hast du ${v} Aufgaben richtig gelöst.`;
										}
									} else if (period === "month") {

									/** ---------- MONTH ---------- */
										let activityLabel = "";
										if (v <= 0) activityLabel = "Keine Aktivität";
										else if (v <= 2) activityLabel = "Sehr geringe Aktivität";
										else if (v <= 4) activityLabel = "Geringe Aktivität";
										else if (v <= 6) activityLabel = "Mittlere Aktivität";
										else if (v <= 8) activityLabel = "Hohe Aktivität";
										else activityLabel = "Sehr hohe Aktivität";

										const dayLabel = (config as any).cellLabel(
											ctx.raw.y,
											ctx.raw.x
										);
										if (!dayLabel) return activityLabel;

										const monthName = currentDate.toLocaleString("de-DE", {
											month: "long"
										});

										if (internalMetric === "hours") {
											const hours = Math.floor(v);
											const minutes = Math.round((v - hours) * 60);
											const timeStr =
												hours > 0
													? `${hours} Std. ${minutes > 0 ? minutes + " Min." : ""}`.trim()
													: `${minutes} Min.`;
											text = `${activityLabel}, am ${dayLabel}. ${monthName} hast du ${timeStr} gelernt.`;
										} else if (internalMetric === "units") {
											const tasks = Math.round(v);
											text = `${activityLabel}, am ${dayLabel}. ${monthName} hast du ${tasks} Aufgaben erledigt.`;
										} else if (internalMetric === "accuracy") {
											const correct = Math.round(v);
											text = `${activityLabel}, am ${dayLabel}. ${monthName} hast du ${correct} Aufgaben korrekt gelöst.`;
										}
									} else if (period === "year") {

									/** ---------- YEAR ---------- */
										let activityLabel = "";
										if (v <= 0) activityLabel = "Keine Aktivität";
										else if (v <= 20) activityLabel = "Sehr geringe Aktivität";
										else if (v <= 40) activityLabel = "Geringe Aktivität";
										else if (v <= 60) activityLabel = "Mittlere Aktivität";
										else if (v <= 80) activityLabel = "Hohe Aktivität";
										else activityLabel = "Sehr hohe Aktivität";

										const monthLabel = (config as any).cellLabel(
											ctx.raw.y,
											ctx.raw.x
										);
										if (!monthLabel) return activityLabel;

										const germanMonths: Record<string, string> = {
											Jan: "Januar",
											Feb: "Februar",
											Mrz: "März",
											Apr: "April",
											Mai: "Mai",
											Jun: "Juni",
											Jul: "Juli",
											Aug: "August",
											Sep: "September",
											Okt: "Oktober",
											Nov: "November",
											Dez: "Dezember"
										};

										const monthName = germanMonths[monthLabel] ?? monthLabel;

										if (internalMetric === "hours") {
											const hours = Math.floor(v);
											const minutes = Math.round((v - hours) * 60);
											const timeStr =
												hours > 0
													? `${hours} Std. ${minutes > 0 ? minutes + " Min." : ""}`.trim()
													: `${minutes} Min.`;
											text = `Im ${monthName} hattest du eine ${activityLabel}. Du hast ${timeStr} gelernt.`;
										} else if (internalMetric === "units") {
											const tasks = Math.round(v);
											text = `Im ${monthName} hattest du eine ${activityLabel}. Du hast ${tasks} Aufgaben erledigt.`;
										} else if (internalMetric === "accuracy") {
											const correct = Math.round(v);
											text = `Im ${monthName} hattest du eine ${activityLabel}. Du hast ${correct} Aufgaben richtig gelöst.`;
										}
									} else {

									/** ---------- WEEK (fallback) ---------- */
										if (v <= 2) text = "Sehr geringe Aktivität";
										else if (v <= 4) text = "Geringe Aktivität";
										else if (v <= 6) text = "Mittlere Aktivität";
										else if (v <= 8) text = "Hohe Aktivität";
										else text = "Sehr hohe Aktivität";
									}

									// 🔹 Text-Wrapping für kleine Bildschirme
									const maxLineLength = window.innerWidth < 600 ? 35 : 45;
									const words = text.split(" ");
									const lines: string[] = [];
									let current = "";
									for (const w of words) {
										if ((current + w).length > maxLineLength) {
											lines.push(current.trim());
											current = w + " ";
										} else {
											current += w + " ";
										}
									}
									if (current.trim() !== "") lines.push(current.trim());
									return lines; // Chart.js zeigt jede Zeile separat
								}
							}
						}
					},
					scales: {
						x: {
							display: period === "week" || period === "month",
							type: "linear",
							position: "top",
							min: -0.5,
							max: cols - 0.5,
							offset: false,
							grid: { display: false },
							border: { display: false },
							ticks: {
								color: "#6B7280",
								maxRotation: 70,
								minRotation: 50,
								font: { size: 11 },
								padding: 4,
								autoSkip: false,
								callback: (tickValue: string | number) => {
									const v = Number(tickValue);
									return period === "week" || period === "month"
										? ((config as any).xLabels[v] ?? "")
										: "";
								}
							}
						},
						y: {
							display: period === "week",
							reverse: true,
							min: -0.5,
							max: rows - 0.5,
							offset: false,
							grid: { display: false },
							ticks: {
								color: "#6B7280",
								font: { size: 11 },
								callback: (tickValue: string | number) => {
									const v = Number(tickValue);
									if (period === "week") return (config as any).yLabels[v] ?? "";
									return "";
								}
							}
						}
					}
				},
				plugins: [labelPlugin]
			});

			(ctx as any)._chartInstance = newChart;
			chartInstance = newChart;
		})();

		return () => {
			const ctx = canvasRef.current;
			if (ctx && (ctx as any)._chartInstance) {
				(ctx as any)._chartInstance.destroy();
				(ctx as any)._chartInstance = null;
			}
			if (chartInstance) chartInstance.destroy();
		};
	}, [config, period, hasNoData, internalMetric]);

	return (
		<div className="w-full" style={{ height: `${heightPx}px` }}>
			{isLoading ? (
				<p className="text-center text-gray-400">Lade Heatmap...</p>
			) : hasNoData ? (
				<div className="w-full h-full flex items-center justify-center">
					<p className="text-gray-400">Keine Daten verfügbar</p>
				</div>
			) : (
				<canvas ref={canvasRef} />
			)}
		</div>
	);
}
