"use client";

import { useEffect, useRef, useState } from "react";
import type { Chart as ChartJS } from "chart.js";
import { useTranslation } from "next-i18next";
import type { LessonActivityResult } from "./LessonSemesterTable";

export function LessonActivityChart({
	courseLabel,
	data,
	isLoading,
	isError
}: {
	courseLabel: string;
	data?: LessonActivityResult | null;
	isLoading: boolean;
	isError: boolean;
}) {
	const { t } = useTranslation("student-analytics");
	const [view, setView] = useState<"period" | "total">("period");
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const chartRef = useRef<ChartJS<"line"> | null>(null);
	const metrics = data?.lessonChart[view];
	const hasData = metrics?.some(lesson => lesson.completionRate !== null) ?? false;

	useEffect(() => {
		let mounted = true;
		if (!metrics || !hasData || isLoading || isError) return;
		(async () => {
			const { default: Chart } = await import("chart.js/auto");
			if (!mounted || !canvasRef.current) return;
			chartRef.current = new Chart<"line">(canvasRef.current, {
				type: "line",
				data: {
					labels: metrics.map((_, index) => String(index + 1)),
					datasets: [
						{
							label: t("Lesson_Chart_Completion_Rate"),
							data: metrics.map(lesson => lesson.completionRate),
							borderColor: "#2563eb",
							backgroundColor: "#2563eb",
							tension: 0.15
						},
						{
							label: t("Lesson_Chart_Average_Score"),
							data: metrics.map(lesson => lesson.averageScore),
							borderColor: "#b45309",
							backgroundColor: "#b45309",
							tension: 0.15
						}
					]
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						tooltip: {
							callbacks: {
								title: items => {
									const index = items[0]?.dataIndex;
									return index === undefined ? "" : (metrics[index]?.title ?? "");
								},
								label: context =>
									`${context.dataset.label}: ${(context.parsed.y ?? 0).toFixed(1)}%`
							}
						}
					},
					scales: {
						y: {
							beginAtZero: true,
							max: 100,
							ticks: { callback: value => `${value}%` }
						},
						x: { ticks: { autoSkip: false }, grid: { display: false } }
					}
				}
			});
		})();
		return () => {
			mounted = false;
			chartRef.current?.destroy();
			chartRef.current = null;
		};
	}, [metrics, hasData, isLoading, isError, t]);

	return (
		<div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
			<div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-5 py-4">
				<h2 className="text-lg font-semibold">
					{t("Lesson_Chart_Title", { courseLabel })}
				</h2>
				<div
					role="group"
					aria-label={t("Lesson_Chart_Range")}
					className="flex rounded-md border border-neutral-300 p-1 text-sm"
				>
					{(["period", "total"] as const).map(option => (
						<button
							key={option}
							type="button"
							aria-pressed={view === option}
							onClick={() => setView(option)}
							className={
								view === option
									? "rounded bg-blue-700 px-3 py-1 text-white"
									: "rounded px-3 py-1 text-neutral-700"
							}
						>
							{t(option === "period" ? "Analysis_Period" : "Analysis_Total")}
						</button>
					))}
				</div>
			</div>
			<div className="p-5">
				{isLoading ? (
					<p className="text-sm text-neutral-600">{t("loadingDashboard")}</p>
				) : isError || !hasData ? (
					<p className="text-sm text-neutral-600">{t("noDataAvailable")}</p>
				) : (
					<div className="overflow-x-auto">
						<div
							style={{
								height: 340,
								minWidth: Math.max(480, (metrics?.length ?? 0) * 36)
							}}
						>
							<canvas
								ref={canvasRef}
								role="img"
								aria-label={t("Lesson_Chart_Title", { courseLabel })}
							/>
						</div>
					</div>
				)}
				<p className="mt-3 text-sm text-neutral-600">{t("Lesson_Chart_Note")}</p>
			</div>
		</div>
	);
}
