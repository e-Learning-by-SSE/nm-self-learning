"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { trpc } from "@self-learning/api-client";

/** ---------- TYPES ---------- */
export type Period = "day" | "week" | "month" | "year";
export type Metric = "hours" | "units" | "accuracy";

/** ---------- COLORS ---------- */
const COLORS = [
	"#D9D9D9", // no activity (exactly 0)
	"#9EF7D9", // 0–2
	"#14E8A2", // >2–4
	"#10B981", // >4–6
	"#0C8A60", // >6–8
	"#085B40" // >8
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
	const d = new Date(dateInput);
	if (isNaN(d.getTime())) return null;
	return d.toISOString().split("T")[0];
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
	// v is already in hours or number of answers depending on metric
	if (v === 0) return COLORS[0]; // no activity
	if (v <= 2) return COLORS[1]; // 0–2
	if (v <= 4) return COLORS[2]; // >2–4
	if (v <= 6) return COLORS[3]; // >4–6
	if (v <= 8) return COLORS[4]; // >6–8
	return COLORS[5]; // >8
};

/** ---------- MAIN COMPONENT ---------- */
export default function StudyTimeHeatmap({
	period,
	metric,
	selection,
	heightPx = 230
}: {
	period: Period;
	metric: Metric | string; // accepts german labels from the modal
	selection: Date;
	heightPx?: number;
}) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	// Fetch both datasets; we switch based on metric
	const learningQuery = trpc.metrics.getUserDailyLearningTime.useQuery();
	const quizQuery = trpc.metrics.getUserDailyQuizStats.useQuery();

	const internalMetric: Metric = normalizeMetric(String(metric));
	const isLoading = learningQuery.isLoading || quizQuery.isLoading;

	// Choose the dataset by metric
	const dailyData = useMemo(() => {
		if (internalMetric === "hours") return learningQuery.data ?? null;
		return quizQuery.data ?? null;
	}, [internalMetric, learningQuery.data, quizQuery.data]);

	// Derived flag for "no data"
	const hasNoData = useMemo(() => {
		return !dailyData || (Array.isArray(dailyData) && dailyData.length === 0);
	}, [dailyData]);

	useEffect(() => {
		// Lightweight debug logs to verify real data wired up
		console.log("📊 Aktueller Filterwert (metric):", internalMetric);
		console.log("📅 Geladene Daten (dailyData):", dailyData);
	}, [internalMetric, dailyData]);

	/** ---------- CONFIG (PURE DATA → MATRIX MODEL) ---------- */
	const config = useMemo(() => {
		const sel = new Date(selection);
		const nowMonth = sel.getMonth();
		const nowYear = sel.getFullYear();

		// Build a date → value map from the chosen dataset
		const dailyMap = new Map<string, number>();
		if (dailyData) {
			for (const entry of dailyData as any[]) {
				// Views use "day" (from SQL view); some older code used "date"
				const iso = normalizeDate(entry.day ?? entry.date);
				if (!iso) continue;

				let value = 0;
				if (internalMetric === "hours") {
					// seconds → hours (absolute hours per day)
					value = (entry.totalTimeSeconds ?? entry.seconds ?? 0) / 3600;
				} else if (internalMetric === "units") {
					// total answers per day
					value = entry.totalAnswers ?? 0;
				} else if (internalMetric === "accuracy") {
					// correct answers per day
					value = entry.correctAnswers ?? 0;
				}

				dailyMap.set(iso, value);
			}
		}

		// ---- Day ----
		if (period === "day") {
			const rows = ["Morgens", "Mittags", "Abends"];
			const cols = Array.from({ length: 8 }, (_, i) => i);
			const isoToday = normalizeDate(sel);
			const val = dailyMap.get(isoToday ?? "") ?? 0;
			// replicate day value across cells to keep the current look
			const values = rows.map(() => cols.map(() => val));
			// keep your label design (1..24)
			const hoursLabel = (r: number, c: number) => String(r * 8 + c + 1);
			return { rows, cols, values, xLabels: [], yLabels: rows, cellLabel: hoursLabel };
		}

		// ---- Week ----
		if (period === "week") {
			const rows = ["Morgens", "Mittags", "Abends"];
			const cols = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
			const start = startOfISOWeek(sel);
			const values: number[][] = [];

			for (let r = 0; r < rows.length; r++) {
				const rowVals: number[] = [];
				for (let i = 0; i < 7; i++) {
					const day = addDays(start, i);
					const iso = normalizeDate(day);
					const v = dailyMap.get(iso ?? "") ?? 0;
					rowVals.push(v);
				}
				values.push(rowVals);
			}

			return { rows, cols, values, xLabels: cols, yLabels: rows, cellLabel: () => "" };
		}

		// ---- Month ----
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
					const val = inMonth ? (dailyMap.get(isoDate ?? "") ?? 0) : -1; // -1 marks outside month
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

		// ---- Year ---- (sum all values per month of the selected year)
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
				const matchingDays = Array.from(dailyMap.entries()).filter(([key]) => {
					const d = new Date(key);
					return d.getMonth() === monthIndex && d.getFullYear() === nowYear;
				});
				const sum = matchingDays.reduce((a, [, v]) => a + v, 0);
				rowVals.push(sum);
				rowLabs.push(months[monthIndex] ?? "");
			}
			values.push(rowVals);
			labels.push(rowLabs);
		}

		return { rows, cols, values, xLabels: [], yLabels: [], cellLabel: (r, c) => labels[r][c] };
	}, [period, selection, dailyData, internalMetric]);

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

			// Keep your overlay labels as is
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
						const bg = raw.v === -1 ? "rgba(0,0,0,0.7)" : colorFor(raw.v);
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
								c.raw.v === -1 ? "rgba(0,0,0,0.7)" : colorFor(c.raw.v),
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
									if (v === 0) return "Keine Aktivität";
									if (v <= 2) return "Geringe Aktivität";
									if (v <= 4) return "Niedrige Aktivität";
									if (v <= 6) return "Mittlere Aktivität";
									if (v <= 8) return "Hohe Aktivität";
									return "Sehr hohe Aktivität";
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
								minRotation: 30,
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
							display: period === "week" || period === "day",
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
									if (period === "week" || period === "day")
										return (config as any).yLabels[v] ?? "";
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
	}, [config, period, hasNoData]);

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
