"use client";

import { useEffect, useRef, useState } from "react";
import { trpc } from "@self-learning/api-client";
import { useSession } from "next-auth/react";
import type { Chart as ChartJS } from "chart.js";
import { useTranslation } from "next-i18next";

const pct = (n?: number) =>
	n === undefined || n === null || !Number.isFinite(n) ? "—" : `${Number(n).toFixed(1)}%`;

const toPctNumber = (v: unknown) => {
	const n = Number(v ?? 0);
	if (!Number.isFinite(n)) return 0;
	return Number(n);
};

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
	overallAverageCompletionPct?: number;
};

function ChartCard({
	title,
	data = [],
	extraAction
}: {
	title: string;
	data?: { label: string; value: number }[];
	extraAction?: React.ReactNode;
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
				{extraAction ? <div>{extraAction}</div> : null}
			</div>

			<div className="relative p-5" style={{ height: 380 }}>
				<canvas ref={canvasRef} />
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

function AnalyticsDashboard({ data }: { data?: DashboardData }) {
	const { t } = useTranslation("student-analytics");
	const [coursePos, setCoursePos] = useState(0);

	const courses = data?.courses ?? [];
	const activeCourse = courses[coursePos];

	const activeCourseId = activeCourse?.courseId ?? "";
	const activeLessons = (data?.lessonsByCourse?.[activeCourseId] ?? []) as LessonItem[];
	const stats = (data?.perCourseStats?.[activeCourseId] ?? {}) as PerCourseStats;

	const lessonBars = activeLessons.map(lesson => ({
		label: lesson.label,
		value: lesson.rate
	}));

	const courseBars = courses.map(c => ({
		label: c.label,
		value: c.rate
	}));

	const goNextCourse = () => {
		if (!courses.length) return;
		setCoursePos(i => (i + 1) % courses.length);
	};

	const lessonChartTitle = activeCourse
		? t("lessonCompletionRateTitleActive", { courseLabel: activeCourse.label })
		: t("lessonCompletionRateTitleGeneric");

	return (
		<div className="max-w-7xl mx-auto p-6 md:p-8">
			<h1 className="text-3xl font-bold mb-6">
				{t("welcomeBackTitle", { name: data?.teacherName ?? "—" })}
			</h1>

			<section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
				<ChartCard
					title={lessonChartTitle}
					data={lessonBars}
					extraAction={
						courses.length > 1 && (
							<button
								onClick={goNextCourse}
								className="text-neutral-600 text-lg hover:text-neutral-800 transition"
								aria-label={t("nextCourse")}
								title={t("nextCourse")}
							>
								→
							</button>
						)
					}
				/>

				<ChartCard title={t("courseCompletionRateTitle")} data={courseBars} />
			</section>

			<section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5">
					<div className="px-5 pt-4 pb-2 border-b border-neutral-200 flex items-center gap-2">
						<h3 className="text-lg font-semibold">{t("analysisTitle")}</h3>
					</div>
					<div className="p-5 text-sm leading-6 space-y-2">
						<p>
							<b>{t("avgLessonCompletion")}</b>: {pct(stats.avgCourseRate)}
						</p>
						<p>
							<b>{t("numberOfStudents")}</b>: {stats.numberOfStudents ?? "—"}
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

				<div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5">
					<div className="px-5 pt-4 pb-2 border-b border-neutral-200 flex items-center gap-2">
						<h3 className="text-lg font-semibold">{t("overviewTitle")}</h3>
					</div>
					<div className="p-5 text-sm leading-6 space-y-2">
						<p>
							<b>{t("overallAvgCompletion")}</b>:{" "}
							{pct(data?.overallAverageCompletionPct)}
						</p>
					</div>
				</div>
			</section>
		</div>
	);
}

export default function LearningAnalyticsPage() {
	const { t } = useTranslation("student-analytics");
	const { data: session, status } = useSession();
	const { data: avgCourse } =
		trpc.metrics.getAuthorMetric_AverageCourseCompletionRate.useQuery(undefined);
	const { data: avgLessonRows } =
		trpc.metrics.getAuthorMetric_AverageLessonCompletionRate.useQuery(undefined);

	const [isClient, setIsClient] = useState(false);
	useEffect(() => {
		setIsClient(true);
	}, []);

	if (!isClient) {
		return <div className="p-10 text-neutral-600">{t("loadingDashboard")}</div>;
	}

	if (status === "loading") {
		return <div className="p-10 text-neutral-600">{t("loadingSession")}</div>;
	}

	const coursesRaw: any[] = Array.isArray(avgCourse) ? avgCourse : [];

	const courses: CourseItem[] = coursesRaw.map(row => ({
		courseId: row.courseId ?? row.coursed ?? row.courseID ?? "—",
		label: row.courseTitle ?? row.courseName ?? "—",
		rate: toPctNumber(row.averageCompletionRate),
		enrollments: Number(row.totalEnrollments ?? 0)
	}));

	const lessonsRaw: any[] = Array.isArray(avgLessonRows) ? avgLessonRows : [];

	const lessonsByCourse: Record<string, LessonItem[]> = {};
	const perCourseHiLo: Record<string, { max?: LessonItem; min?: LessonItem }> = {};
	const perCourseAgg: Record<
		string,
		{ sum: number; count: number; students?: number; avgCourseCompletionFromRow?: number }
	> = {};

	for (const row of lessonsRaw) {
		const cId: string = (row.courseId ?? row.coursed ?? "—").toString().trim();
		const lessonName: string = row.lessonTitle ?? row.lessonId ?? "Lektion";
		const lessonRate: number = toPctNumber(row.averageCompletionRate);

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
		if (row.usersStarted !== undefined) {
			agg.students = Number(row.usersStarted);
		}
		perCourseAgg[cId] = agg;
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

	let overallAverageCompletionPct: number | undefined = undefined;

	if (courses.length > 0) {
		const usable = courses.filter(c => Number.isFinite(c.rate) && c.rate > 0);
		if (usable.length > 0) {
			const sum = usable.reduce((acc, c) => acc + c.rate, 0);
			overallAverageCompletionPct = sum / usable.length;
		} else {
			overallAverageCompletionPct = 0;
		}
	}

	const teacherNameGuess =
		((session?.user as any)?.name as string) ||
		((session?.user as any)?.username as string) ||
		((session?.user as any)?.email as string) ||
		t("defaultName");

	const dashboardData: DashboardData | undefined = courses.length
		? {
				teacherName: teacherNameGuess,
				courses,
				lessonsByCourse,
				perCourseStats,
				overallAverageCompletionPct
			}
		: undefined;

	return (
		<div className="bg-neutral-50 min-h-screen relative">
			<AnalyticsDashboard data={dashboardData} />
		</div>
	);
}
