"use client";

import { useEffect, useRef, useState } from "react";
import { trpc } from "@self-learning/api-client";
import { useSession } from "next-auth/react";
import type { Chart as ChartJS } from "chart.js";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useRouter } from "next/router";

const pct = (n?: number) =>
	n === undefined || n === null || !Number.isFinite(n) ? "—" : `${Number(n).toFixed(1)}%`;

const colorGreen = "#7fb89b";
const colorYellow = "#eae282";
const colorRed = "#e57368";
const colorAxis = "#525252";

type LessonItem = {
	label: string;
	rate: number;
};

type CourseItem = {
	courseId: string;
	label: string;
	rate: number;
	enrollments: number;
	recentEnrollments: number;
	recentRate: number;
};

type PerCourseStats = {
	avgCourseRate?: number;
	numberOfStudents?: number;
	highestLessonName?: string;
	highestLessonRate?: number;
	lowestLessonName?: string;
	lowestLessonRate?: number;
};

type DashboardData = {
	teacherName: string;
	courses: CourseItem[];
	lessonsByCourse: Record<string, LessonItem[]>;
	perCourseStats: Record<string, PerCourseStats>;
};

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
	}, [data, onSelect]);

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
						<a key={course.href} href={course.href}>
							{course.label}
						</a>
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

function AnalyticsDashboard({ data, courseId }: { data: DashboardData; courseId?: string }) {
	const { t } = useTranslation("student-analytics");
	const router = useRouter();
	const courses = data.courses;
	const activeCourse = courses.find(course => course.courseId === courseId);
	const stats = activeCourse ? (data.perCourseStats[activeCourse.courseId] ?? {}) : {};
	const lessonBars = (
		activeCourse ? (data.lessonsByCourse[activeCourse.courseId] ?? []) : []
	).map(lesson => ({ label: lesson.label, value: lesson.rate }));
	const courseBars = courses.map(course => ({ label: course.label, value: course.rate }));
	const courseHref = (id: string) => `/learning-analytics/courses/${encodeURIComponent(id)}`;

	return (
		<div className="max-w-7xl mx-auto p-6 md:p-8">
			{courseId ? (
				<>
					<Link href="/learning-analytics" className="text-blue-700 underline">
						{t("Back_To_Courses")}
					</Link>
					{activeCourse ? (
						<section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
							<ChartCard
								title={t("lessonCompletionRateTitleActive", {
									courseLabel: activeCourse.label
								})}
								data={lessonBars}
							/>
							<div
								id="AnalysisCard"
								className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5"
							>
								<div className="px-5 pt-4 pb-2 border-b border-neutral-200 flex items-center gap-2">
									<h3 className="text-lg font-semibold">{t("analysisTitle")}</h3>
								</div>
								<div className="p-5 text-sm leading-6 space-y-2">
									<p>
										<b>{t("avgLessonCompletion")}</b>:{" "}
										{pct(stats.avgCourseRate)}
									</p>
									<p>
										<b>{t("numberOfStudents")}</b>:{" "}
										{stats.numberOfStudents ?? "—"}
									</p>
									<p>
										<b>{t("highestCompletion")}</b>:{" "}
										{stats.highestLessonName
											? `${stats.highestLessonName} – ${pct(stats.highestLessonRate)}`
											: "—"}
									</p>
									<p>
										<b>{t("lowestCompletion")}</b>:{" "}
										{stats.lowestLessonName
											? `${stats.lowestLessonName} – ${pct(stats.lowestLessonRate)}`
											: "—"}
									</p>
								</div>
							</div>
						</section>
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
					<section className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
						<table className="w-full min-w-[760px] text-left text-sm">
							<thead className="border-b border-neutral-200 bg-neutral-50">
								<tr>
									<th scope="col" className="px-5 py-4 font-semibold">
										{t("Courses_Table_Course")}
									</th>
									<th scope="col" className="px-5 py-4 font-semibold">
										{t("Courses_Table_Enrollments_6_Months")}
									</th>
									<th scope="col" className="px-5 py-4 font-semibold">
										{t("Courses_Table_Enrollments_Total")}
									</th>
									<th scope="col" className="px-5 py-4 font-semibold">
										{t("Courses_Table_Completion_6_Months")}
									</th>
									<th scope="col" className="px-5 py-4 font-semibold">
										{t("Courses_Table_Completion_Total")}
									</th>
								</tr>
							</thead>
							<tbody>
								{courses.map(course => (
									<tr
										key={course.courseId}
										className="border-b border-neutral-100 last:border-0"
									>
										<th scope="row" className="px-5 py-4 font-medium">
											<Link
												href={courseHref(course.courseId)}
												className="text-blue-700 underline"
											>
												{course.label}
											</Link>
										</th>
										<td className="px-5 py-4">{course.recentEnrollments}</td>
										<td className="px-5 py-4">{course.enrollments}</td>
										<td className="px-5 py-4">{pct(course.recentRate)}</td>
										<td className="px-5 py-4">{pct(course.rate)}</td>
									</tr>
								))}
								{courses.length === 0 && (
									<tr>
										<td
											colSpan={5}
											className="px-5 py-6 text-center text-neutral-500"
										>
											{t("noDataAvailable")}
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</section>
					<p className="mt-3 text-sm text-neutral-600">
						{t("Courses_Table_Completion_Note")}
					</p>
				</>
			)}
		</div>
	);
}

export function CreatorAnalytics({ courseId }: { courseId?: string }) {
	const { t } = useTranslation("student-analytics");
	const { data: session, status } = useSession();
	const { data: avgCourse, isLoading: isLoadingAvgCourse } =
		trpc.metrics.getAuthorMetric_AverageCourseCompletionRate.useQuery(undefined);
	const { data: avgLessonRows, isLoading: isLoadingAvgLessonRows } =
		trpc.metrics.getAuthorMetric_AverageLessonCompletionRate.useQuery(undefined, {
			enabled: !!courseId
		});

	const [isClient, setIsClient] = useState(false);
	useEffect(() => {
		setIsClient(true);
	}, []);

	if (!isClient) {
		return <div className="p-10 text-neutral-600">{t("loadingDashboard")}</div>;
	}

	if (status === "loading" || isLoadingAvgCourse || (!!courseId && isLoadingAvgLessonRows)) {
		return <div className="p-10 text-neutral-600">{t("loadingSession")}</div>;
	}

	let courses: CourseItem[] = [];
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

	const lessonsByCourse: Record<string, LessonItem[]> = {};
	const perCourseHiLo: Record<string, { max?: LessonItem; min?: LessonItem }> = {};
	const perCourseAgg: Record<
		string,
		{ sum: number; count: number; students?: number; avgCourseCompletionFromRow?: number }
	> = {};

	if (avgLessonRows) {
		for (const row of avgLessonRows) {
			const cId = row.courseId;
			const lessonName = row.lessonTitle;
			const lessonRate = row.averageCompletionRate;

			(lessonsByCourse[cId] ??= []).push({
				label: lessonName,
				rate: lessonRate
			});

			const current = perCourseHiLo[cId] ?? {};
			if (!current.max || lessonRate > current.max.rate) {
				current.max = { label: lessonName, rate: lessonRate };
			}
			if (!current.min || lessonRate < current.min.rate) {
				current.min = { label: lessonName, rate: lessonRate };
			}
			perCourseHiLo[cId] = current;

			const agg = perCourseAgg[cId] ?? { sum: 0, count: 0 };
			agg.sum += lessonRate;
			agg.count += 1;
			agg.students = row.usersStarted;
			perCourseAgg[cId] = agg;
		}
	}

	const perCourseStats: Record<string, PerCourseStats> = {};

	for (const cId of Object.keys(perCourseAgg)) {
		const agg = perCourseAgg[cId];
		const fallbackAvg = agg.count > 0 ? agg.sum / agg.count : undefined;

		perCourseStats[cId] = {
			avgCourseRate: fallbackAvg,
			numberOfStudents: agg.students
		};
	}

	for (const cId of Object.keys(perCourseHiLo)) {
		const hiLo = perCourseHiLo[cId];
		perCourseStats[cId] = {
			...(perCourseStats[cId] ?? {}),
			highestLessonName: hiLo.max?.label,
			highestLessonRate: hiLo.max?.rate,
			lowestLessonName: hiLo.min?.label,
			lowestLessonRate: hiLo.min?.rate
		};
	}

	const teacherNameGuess = session?.user.name ?? t("defaultName");

	const dashboardData: DashboardData = {
		teacherName: teacherNameGuess,
		courses,
		lessonsByCourse,
		perCourseStats
	};

	return (
		<div className="bg-neutral-50 min-h-screen relative">
			<AnalyticsDashboard data={dashboardData} courseId={courseId} />
		</div>
	);
}
