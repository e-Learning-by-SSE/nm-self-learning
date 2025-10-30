"use client";

import { trpc } from "@self-learning/api-client";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartOptions } from "chart.js";
import { useMemo } from "react";
import { useTranslation } from "next-i18next";

ChartJS.register(ArcElement, Tooltip, Legend);

export function TimeAllocation() {
	const { t } = useTranslation("student-analytics");
	const { data, isLoading } = trpc.metrics.getStudentMetric_LearningTimeByCourse.useQuery();

	const courses = (data ?? []).filter(
		c => c.courseTitle && c.courseTitle !== "N/A" && (c.timeSeconds ?? 0) > 0
	);

	const totalSeconds = courses.reduce((acc, c) => acc + (c.timeSeconds ?? 0), 0);
	const totalHours = Math.floor(totalSeconds / 3600);
	const totalMinutes = Math.round((totalSeconds % 3600) / 60);

	// Muted palette
	const generateSoftPalette = (count: number): string[] => {
		const baseColors = [
			"#A7F3D0",
			"#6EE7B7",
			"#5EEAD4",
			"#93C5FD",
			"#BFDBFE",
			"#C7D2FE",
			"#D1FAE5",
			"#E5E7EB",
			"#9CA3AF",
			"#CBD5E1"
		];
		if (count > baseColors.length) {
			for (let i = baseColors.length; i < count; i++) {
				const hue = 180 + ((i * 15) % 60);
				const color = `hsl(${hue}, 30%, 75%)`;
				baseColors.push(color);
			}
		}
		return baseColors.slice(0, count);
	};

	const chartData = useMemo(() => {
		if (courses.length === 0 || totalSeconds === 0) {
			return {
				labels: [t("noData")],
				datasets: [{ data: [1], backgroundColor: ["#E5E7EB"] }]
			};
		}

		const labels = courses.map(c => c.courseTitle);
		const values = courses.map(c => Math.round(((c.timeSeconds ?? 0) / totalSeconds) * 100));
		const colors = generateSoftPalette(courses.length);

		return {
			labels,
			datasets: [
				{
					label: t("timeAllocationTitle"),
					data: values,
					backgroundColor: colors,
					borderColor: "#fff",
					borderWidth: 2
				}
			]
		};
	}, [courses, totalSeconds, t]);

	const options: ChartOptions<"pie"> = {
		animation: { duration: 1200, easing: "easeOutQuart" },
		plugins: {
			legend: {
				position: "bottom",
				align: "center",
				labels: {
					color: "#374151",
					font: { size: 13 },
					usePointStyle: true,
					pointStyle: "circle",
					boxWidth: 10, // smaller round icons
					padding: 8 // tighter vertical spacing
				}
			},
			tooltip: {
				callbacks: {
					label: function (context) {
						const label = context.label || "";
						const value = context.parsed || 0;
						return `${label}: ${value}%`;
					}
				}
			}
		},
		maintainAspectRatio: false
	};

	if (isLoading) {
		return (
			<div className="w-full h-full rounded-lg border border-light-border bg-white shadow-sm p-6 text-center text-gray-500">
				{t("loading")}
			</div>
		);
	}

	if (courses.length === 0) {
		return (
			<div className="w-full h-full rounded-lg border border-light-border bg-white shadow-sm p-6 text-center text-gray-500">
				{t("noData")}
			</div>
		);
	}

	return (
		<div className="w-full h-full rounded-lg border border-light-border bg-white shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col text-center sm:text-left">
			<h2 className="text-xl font-semibold text-gray-800 mb-4 sm:text-left text-center">
				{t("timeAllocationTitle")}
			</h2>

			{/* Chart container – slightly larger (≈10%) */}
			<div
				className="relative flex-grow w-full mx-auto"
				style={{ height: "250px", maxWidth: "520px" }}
			>
				<Pie data={chartData} options={options} />
			</div>

			<div className="mt-5 text-sm text-gray-700 border-t pt-3 sm:text-left text-center">
				<b>{t("totalLearningTime")}:</b>{" "}
				{totalHours > 0
					? `${totalHours} ${t("hours")}${totalMinutes > 0 ? ` ${t("and")} ${totalMinutes} ${t("minutes")}` : ""}`
					: `${totalMinutes} ${t("minutes")}`}
			</div>
		</div>
	);
}
