"use client";

import { useEffect, useRef, useState } from "react";
import { trpc } from "@self-learning/api-client";
import { useSession } from "next-auth/react";
import type { Chart as ChartJS } from "chart.js";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useRouter } from "next/router";
import { CourseMetricsTable, type CourseMetricsItem } from "./CourseMetricsTable";
import { LessonActivityChart } from "./LessonActivityChart";
import { LessonSemesterTable, type LessonActivityResult } from "./LessonSemesterTable";

const colorGreen = "#7fb89b";
const colorYellow = "#eae282";
const colorRed = "#e57368";
const colorAxis = "#525252";

type DashboardData = {
	teacherName: string;
	courses: CourseMetricsItem[];
};

function getCurrentSemesterRange() {
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone: "Europe/Berlin",
		year: "numeric",
		month: "2-digit"
	}).formatToParts(new Date());
	const year = Number(parts.find(part => part.type === "year")?.value);
	const month = Number(parts.find(part => part.type === "month")?.value);
	const winterSemester = month < 4 || month >= 10;
	const startYear = month < 4 ? year - 1 : year;
	const endYear = winterSemester && month >= 10 ? year + 1 : year;
	const start = new Date(Date.UTC(startYear, winterSemester ? 9 : 3, 1));
	const end = new Date(Date.UTC(endYear, winterSemester ? 3 : 9, 0));
	return {
		startDate: start.toISOString().slice(0, 10),
		endDate: end.toISOString().slice(0, 10)
	};
}

function ChartCard({
	title,
	data = [],
	onSelect,
	courseLinks
}: {
	title: string;
	data?: { label: string; value: number }[];
	onSelect?: (index: number) => void;
	courseLinks?: { label: string; href: string }[];
}) {
	const { t } = useTranslation("student-analytics");
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const chartRef = useRef<ChartJS<"bar"> | null>(null);

	useEffect(() => {
		let mounted = true;

		(async () => {
			const { default: Chart } = await import("chart.js/auto");

			chartRef.current?.destroy();
			if (!mounted || !canvasRef.current) return;

			const labels = data.map(d => d.label);
			const values = data.map(d => d.value);

			const colors = values.map(v =>
				v >= 70 ? colorGreen : v >= 40 ? colorYellow : colorRed
			);

			chartRef.current = new Chart<"bar">(canvasRef.current, {
				type: "bar",
				data: {
					labels,
					datasets: [
						{
							data: values,
							backgroundColor: colors,
							borderRadius: 8,
							maxBarThickness: 36
						}
					]
				},
				options: {
					indexAxis: "y",
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						legend: { display: false },
						tooltip: {
							callbacks: {
								label: ctx => `${ctx.parsed["x"]?.toFixed?.(1) ?? 0}%`
							}
						}
					},
					scales: {
						x: {
							beginAtZero: true,
							max: 100,
							ticks: {
								callback: v => `${v}%`,
								color: colorAxis,
								font: { size: 11 }
							},
							grid: { color: "#e5e7eb" }
						},
						y: {
							ticks: {
								color: colorAxis,
								font: { size: 11 },
								autoSkip: false
							},
							grid: { display: false }
						}
					}
				}
			});
		})();

		return () => {
			mounted = false;
			chartRef.current?.destroy();
		};
	}, [data]);

	const empty = !data.length;

	return (
		<div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5">
			<div className="px-5 pt-4 pb-2 border-b border-neutral-200 flex items-start justify-between">
				<h2 className="text-lg font-semibold">{title}</h2>
			</div>

			<div className="relative p-5" style={{ height: 380 }}>
				<canvas
					ref={canvasRef}
					className={onSelect ? "cursor-pointer" : undefined}
					onClick={event => {
						const chart = chartRef.current;
						if (!onSelect || !chart) return;
						const bounds = event.currentTarget.getBoundingClientRect();
						const x = ((event.clientX - bounds.left) * chart.width) / bounds.width;
						const y = ((event.clientY - bounds.top) * chart.height) / bounds.height;
						const axis = chart.scales["y"];
						if (
							!axis ||
							x < axis.left ||
							x > chart.chartArea.right ||
							y < chart.chartArea.top ||
							y > chart.chartArea.bottom
						)
							return;
						const index = axis.getValueForPixel(y);
						if (index !== undefined && index >= 0 && index < data.length)
							onSelect(index);
					}}
				>
					{courseLinks?.map(course => (
						<span key={course.href}>{course.label}</span>
					))}
				</canvas>
				{empty && (
					<div className="absolute inset-0 flex items-center justify-center text-neutral-500 text-sm">
						{t("noDataAvailable")}
					</div>
				)}
			</div>
		</div>
	);
}

/* ---------- Dashboard ---------- */

function AnalyticsDashboard({
	data,
	courseId,
	startDate,
	endDate,
	onDateRangeChange,
	lessonActivity,
	isLoadingLessonActivity,
	isLessonActivityError
}: {
	data: DashboardData;
	courseId?: string;
	startDate: string;
	endDate: string;
	onDateRangeChange: (range: { startDate: string; endDate: string }) => void;
	lessonActivity?: LessonActivityResult | null;
	isLoadingLessonActivity: boolean;
	isLessonActivityError: boolean;
}) {
	const { t, i18n } = useTranslation("student-analytics");
	const router = useRouter();
	const courses = data.courses;
	const activeCourse = courses.find(course => course.courseId === courseId);
	const courseBars = courses.map(course => ({ label: course.label, value: course.rate }));
	const courseHref = (id: string) => `/learning-analytics/courses/${encodeURIComponent(id)}`;
	const formatCount = (value?: number | null) =>
		value == null
			? "—"
			: new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 0 }).format(value);
	const formatAverage = (value?: number | null) =>
		value == null
			? "—"
			: new Intl.NumberFormat(i18n.language, {
					maximumFractionDigits: 1,
					minimumFractionDigits: 1
				}).format(value);
	const completedLessonStats = [
		{ key: "min", label: t("Analysis_Minimum"), format: formatCount },
		{ key: "max", label: t("Analysis_Maximum"), format: formatCount },
		{ key: "avg", label: t("Analysis_Average"), format: formatAverage }
	] as const;

	return (
		<div className="max-w-7xl mx-auto p-6 md:p-8">
			{courseId ? (
				<>
					<div className="flex flex-wrap items-end justify-between gap-4">
						<Link href="/learning-analytics" className="text-blue-700 underline">
							{t("Back_To_Courses")}
						</Link>
						<div className="flex flex-wrap items-end gap-3">
							<label className="flex flex-col gap-1 text-sm">
								<span>{t("Date_Range_From")}</span>
								<input
									type="date"
									value={startDate}
									max={endDate}
									onChange={event => {
										if (event.target.value)
											onDateRangeChange({
												startDate: event.target.value,
												endDate
											});
									}}
									className="rounded-md border border-neutral-300 bg-white px-3 py-2"
								/>
							</label>
							<label className="flex flex-col gap-1 text-sm">
								<span>{t("Date_Range_To")}</span>
								<input
									type="date"
									value={endDate}
									min={startDate}
									onChange={event => {
										if (event.target.value)
											onDateRangeChange({
												startDate,
												endDate: event.target.value
											});
									}}
									className="rounded-md border border-neutral-300 bg-white px-3 py-2"
								/>
							</label>
						</div>
					</div>
					{activeCourse ? (
						<>
							<section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
								<LessonActivityChart
									courseLabel={activeCourse.label}
									data={lessonActivity}
									isLoading={isLoadingLessonActivity}
									isError={isLessonActivityError}
								/>
								<div
									id="AnalysisCard"
									className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5"
								>
									<div className="px-5 pt-4 pb-2 border-b border-neutral-200 flex items-center gap-2">
										<h3 className="text-lg font-semibold">
											{t("analysisTitle")}
										</h3>
									</div>
									<div className="overflow-x-auto p-5">
										<table className="w-full text-sm">
											<thead>
												<tr className="text-left">
													<th className="pb-3 pr-3 font-medium" />
													<th className="pb-3 px-2 font-semibold">
														{t("Analysis_Period")}
													</th>
													<th className="pb-3 px-2 font-semibold">
														{t("Analysis_Total")}
													</th>
												</tr>
											</thead>
											<tbody>
												<tr className="border-t border-neutral-100">
													<th className="py-2 pr-3 text-left font-medium">
														{t("Analysis_Enrollments")}
													</th>
													<td className="px-2 py-2">
														{formatCount(
															lessonActivity?.analytics.period
																.enrollments
														)}
													</td>
													<td className="px-2 py-2">
														{formatCount(
															lessonActivity?.analytics.total
																.enrollments
														)}
													</td>
												</tr>
												{completedLessonStats.map(row => (
													<tr
														key={row.key}
														className="border-t border-neutral-100"
													>
														<th className="py-2 pr-3 text-left font-medium">
															{t("Analysis_Completed_Lessons", {
																stat: row.label
															})}
														</th>
														<td className="px-2 py-2">
															{row.format(
																lessonActivity?.analytics.period
																	.completedLessons[row.key]
															)}
														</td>
														<td className="px-2 py-2">
															{row.format(
																lessonActivity?.analytics.total
																	.completedLessons[row.key]
															)}
														</td>
													</tr>
												))}
											</tbody>
										</table>
										{isLoadingLessonActivity && (
											<p className="pt-2 text-xs text-neutral-500">
												{t("loadingDashboard")}
											</p>
										)}
										{isLessonActivityError && (
											<p className="pt-2 text-xs text-red-600">
												{t("noDataAvailable")}
											</p>
										)}
									</div>
								</div>
							</section>
							<LessonSemesterTable
								data={lessonActivity}
								isLoading={isLoadingLessonActivity}
								isError={isLessonActivityError}
							/>
						</>
					) : (
						<p className="mt-6">{t("Course_Not_Found")}</p>
					)}
				</>
			) : (
				<>
					<h1 id="author-analytics-title" className="text-3xl font-bold mb-6">
						{t("welcomeBackTitle", { name: data.teacherName })}
					</h1>
					<section className="mb-6">
						<ChartCard
							title={t("courseCompletionRateTitle")}
							data={courseBars}
							courseLinks={courses.map(course => ({
								label: course.label,
								href: courseHref(course.courseId)
							}))}
							onSelect={index => {
								const course = courses[index];
								if (course) void router.push(courseHref(course.courseId));
							}}
						/>
					</section>
					<CourseMetricsTable courses={courses} />
				</>
			)}
		</div>
	);
}

export function CreatorAnalytics({ courseId }: { courseId?: string }) {
	const { t } = useTranslation("student-analytics");
	const { data: session, status } = useSession();
	const [fallbackDateRange] = useState(getCurrentSemesterRange);
	const [selectedDateRange, setDateRange] = useState<{
		startDate: string;
		endDate: string;
	} | null>(null);
	const { data: lecturePeriod, isLoading: isLoadingLecturePeriod } =
		trpc.metrics.getCurrentLecturePeriod.useQuery(undefined, {
			enabled: !!courseId,
			retry: false,
			staleTime: 60 * 60 * 1000,
			refetchOnWindowFocus: false
		});
	const dateRange = selectedDateRange ?? lecturePeriod ?? fallbackDateRange;
	const { data: avgCourse, isLoading: isLoadingAvgCourse } =
		trpc.metrics.getAuthorMetric_AverageCourseCompletionRate.useQuery(undefined);
	const {
		data: lessonActivity,
		isLoading: isLoadingLessonActivity,
		isError: isLessonActivityError
	} = trpc.metrics.getAuthorCourseLessonActivity.useQuery(
		{ courseId: courseId ?? "", startDate: dateRange.startDate, endDate: dateRange.endDate },
		{ enabled: !!courseId && !isLoadingLecturePeriod }
	);

	const [isClient, setIsClient] = useState(false);
	useEffect(() => {
		setIsClient(true);
	}, []);

	if (!isClient) {
		return <div className="p-10 text-neutral-600">{t("loadingDashboard")}</div>;
	}

	if (status === "loading" || isLoadingAvgCourse || (!!courseId && isLoadingLecturePeriod)) {
		return <div className="p-10 text-neutral-600">{t("loadingSession")}</div>;
	}

	let courses: CourseMetricsItem[] = [];
	if (avgCourse) {
		courses = avgCourse
			.map(row => ({
				courseId: row.courseId,
				label: row.courseTitle,
				rate: row.averageCompletionRate,
				enrollments: row.totalEnrollments,
				recentEnrollments: row.enrollmentsLastSixMonths,
				recentRate: row.averageCompletionRateLastSixMonths
			}))
			.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
	}

	const teacherNameGuess = session?.user.name ?? t("defaultName");

	const dashboardData: DashboardData = {
		teacherName: teacherNameGuess,
		courses
	};

	return (
		<div className="bg-neutral-50 min-h-screen relative">
			<AnalyticsDashboard
				data={dashboardData}
				courseId={courseId}
				startDate={dateRange.startDate}
				endDate={dateRange.endDate}
				onDateRangeChange={setDateRange}
				lessonActivity={lessonActivity}
				isLoadingLessonActivity={isLoadingLessonActivity}
				isLessonActivityError={isLessonActivityError}
			/>
		</div>
	);
}
