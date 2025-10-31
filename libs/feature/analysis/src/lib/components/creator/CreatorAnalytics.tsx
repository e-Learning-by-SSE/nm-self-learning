"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { withTranslations } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import type { Chart as ChartJS } from "chart.js";

/* ---------- Helpers ---------- */

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

/* ---------- Types ---------- */

type LessonItem = {
	label: string; // lessonTitle
	rate: number; // averageCompletionRate (%)
};

type CourseItem = {
	courseId: string;
	label: string; // courseTitle
	rate: number; // averageCompletionRate für den Kurs
	enrollments: number; // totalEnrollments
};

type PerCourseStats = {
	avgCourseRate?: number; // averageCourseCompletion / Fallback
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

/* ---------- ChartCard ---------- */

function ChartCard({
	title,
	data = [],
	extraAction
}: {
	title: string;
	data?: { label: string; value: number }[];
	extraAction?: React.ReactNode;
}) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const chartRef = useRef<ChartJS | null>(null);

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

			chartRef.current = new Chart(canvasRef.current, {
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
						No data yet
					</div>
				)}
			</div>
		</div>
	);
}

/* ---------- Dashboard Layout ---------- */

function AnalyticsDashboard({ data }: { data?: DashboardData }) {
	const [coursePos, setCoursePos] = useState(0);

	const courses = data?.courses ?? [];
	const activeCourse = courses[coursePos];

	const activeCourseId = activeCourse?.courseId ?? "";
	const activeLessons = (data?.lessonsByCourse?.[activeCourseId] ?? []) as LessonItem[];
	const stats = (data?.perCourseStats?.[activeCourseId] ?? {}) as PerCourseStats;

	// Chart-Daten
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

	// Hier zusätzlich lesbarere Debug-Infos ausgeben
	const lessonsKeys = data ? Object.keys(data.lessonsByCourse ?? {}) : [];
	const statsKeys = data ? Object.keys(data.perCourseStats ?? {}) : [];

	return (
		<div className="max-w-7xl mx-auto p-6 md:p-8">
			<h1 className="text-3xl font-bold mb-6">
				Willkommen zurück,{" "}
				<span className="text-neutral-700">{data?.teacherName ?? "—"}</span>!
			</h1>

			<section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
				{/* Linkes Chart */}
				<ChartCard
					title={
						activeCourse
							? `Completion Rate – ${activeCourse.label}`
							: "Completion Rate – Lessons"
					}
					data={lessonBars}
					extraAction={
						courses.length > 1 && (
							<button
								onClick={goNextCourse}
								className="text-neutral-600 text-lg hover:text-neutral-800 transition"
								aria-label="Next course"
								title="Next course"
							>
								→
							</button>
						)
					}
				/>

				{/* Rechtes Chart */}
				<ChartCard title="Average Completion Rate – Courses" data={courseBars} />
			</section>

			<section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Analysis Box */}
				<div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5">
					<div className="px-5 pt-4 pb-2 border-b border-neutral-200 flex items-center gap-2">
						<h3 className="text-lg font-semibold">Analysis</h3>
					</div>
					<div className="p-5 text-sm leading-6 space-y-2">
						<div>• Average Lesson Completion: {pct(stats.avgCourseRate)}</div>
						<div>• Number of Students: {stats.numberOfStudents ?? "—"}</div>
						<div>
							• Highest Completion:{" "}
							{stats.highestLessonName
								? `${stats.highestLessonName} – ${pct(stats.highestLessonRate)}`
								: "—"}
						</div>
						<div>
							• Lowest Completion:{" "}
							{stats.lowestLessonName
								? `${stats.lowestLessonName} – ${pct(stats.lowestLessonRate)}`
								: "—"}
						</div>
					</div>
				</div>

				{/* Overview Box */}
				<div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5">
					<div className="px-5 pt-4 pb-2 border-b border-neutral-200 flex items-center gap-2">
						<h3 className="text-lg font-semibold">Overview</h3>
					</div>
					<div className="p-5 text-sm leading-6">
						Average Completion Rate Overall:{" "}
						<b>{pct(data?.overallAverageCompletionPct)}</b>
					</div>
				</div>
			</section>

			{/* DEBUG PANEL */}
			<div className="mt-10 text-xs text-neutral-700 font-mono bg-neutral-100 border border-neutral-300 rounded-lg p-4 whitespace-pre-wrap">
				<div>DEBUG</div>
				<div>activeCourseId: {activeCourseId || "(none)"}</div>
				<div>
					activeLessons.length:{" "}
					{Array.isArray(activeLessons) ? activeLessons.length : "—"}
				</div>
				<div>
					stats.avgCourseRate:{" "}
					{stats.avgCourseRate !== undefined ? pct(stats.avgCourseRate) : "—"}
				</div>
				<div>lessonsByCourse keys: {lessonsKeys.join(", ") || "(none)"}</div>
				<div>perCourseStats keys: {statsKeys.join(", ") || "(none)"}</div>
			</div>
		</div>
	);
}

/* ---------- SSR Wrapper ---------- */

export const getServerSideProps = withTranslations(["common"]);

/* ---------- Page Component (Data Wiring) ---------- */

export default function LearningAnalyticsPage() {
	const { data: session, status } = useSession();

	// Queries
	const { data: avgAuthor } =
		trpc.metrics.getAuthorMetric_AverageCompletionRate.useQuery(undefined);

	const { data: avgCourse } =
		trpc.metrics.getAuthorMetric_AverageCourseCompletionRate.useQuery(undefined);

	const { data: avgLessonRows } =
		trpc.metrics.getAuthorMetric_AverageLessonCompletionRate.useQuery(undefined);

	if (status === "loading") {
		return <div className="p-10 text-neutral-600">Lade Session …</div>;
	}

	/* --- Kurse (rechtes Diagramm) --- */

	const coursesRaw: any[] = Array.isArray(avgCourse) ? avgCourse : [];

	const courses: CourseItem[] = coursesRaw.map(row => ({
		courseId: row.courseId ?? row.coursed ?? row.courseID ?? "—",
		label: row.courseTitle ?? row.courseName ?? "—",
		rate: toPctNumber(row.averageCompletionRate),
		enrollments: Number(row.totalEnrollments ?? 0)
	}));

	/* --- Lessons / Kursstats (linkes Diagramm + Analysis Box) --- */

	const lessonsRaw: any[] = Array.isArray(avgLessonRows) ? avgLessonRows : [];

	const lessonsByCourse: Record<string, LessonItem[]> = {};
	const perCourseHiLo: Record<string, { max?: LessonItem; min?: LessonItem }> = {};

	const perCourseAgg: Record<
		string,
		{
			sum: number;
			count: number;
			students?: number;
			avgCourseCompletionFromRow?: number;
		}
	> = {};

	// LOG: Was kommt überhaupt aus avgLessonRows?
	console.log("[Page] avgLessonRows raw query:", avgLessonRows);

	for (const row of lessonsRaw) {
		// LOG: einzelne Row zeigen
		console.log("[Page] lesson row:", row);

		const cId: string = (row.courseId ?? row.coursed ?? "—").toString().trim();

		const lessonName: string = row.lessonTitle ?? row.lessonId ?? "Lesson";
		const lessonRate: number = toPctNumber(row.averageCompletionRate);

		// 1. Lessons sammeln
		(lessonsByCourse[cId] ??= []).push({
			label: lessonName,
			rate: lessonRate
		});

		// 2. High/Low tracken
		const current = perCourseHiLo[cId] ?? {};
		if (!current.max || lessonRate > current.max.rate) {
			current.max = { label: lessonName, rate: lessonRate };
		}
		if (!current.min || lessonRate < current.min.rate) {
			current.min = { label: lessonName, rate: lessonRate };
		}
		perCourseHiLo[cId] = current;

		// 3. Aggregation
		const agg = perCourseAgg[cId] ?? { sum: 0, count: 0 };

		agg.sum += lessonRate;
		agg.count += 1;

		if (row.usersStarted !== undefined) {
			agg.students = Number(row.usersStarted);
		}

		if (row.averageCourseCompletion !== undefined) {
			agg.avgCourseCompletionFromRow = toPctNumber(row.averageCourseCompletion);
		}

		perCourseAgg[cId] = agg;
	}

	const perCourseStats: Record<string, PerCourseStats> = {};

	for (const cId of Object.keys(perCourseAgg)) {
		const agg = perCourseAgg[cId];

		const fallbackAvg = agg.count > 0 ? agg.sum / agg.count : undefined;

		perCourseStats[cId] = {
			avgCourseRate:
				agg.avgCourseCompletionFromRow !== undefined
					? agg.avgCourseCompletionFromRow
					: fallbackAvg,
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

	// LOG: Was haben wir nach dem Mapping wirklich gebaut?
	console.log("[Page] lessonsByCourse keys:", Object.keys(lessonsByCourse));
	console.log("[Page] lessonsByCourse:", lessonsByCourse);
	console.log("[Page] perCourseStats keys:", Object.keys(perCourseStats));
	console.log("[Page] perCourseStats:", perCourseStats);

	/* --- Overview (unten rechts) --- */

	let overallAverageCompletionPct: number | undefined = undefined;

	if (Array.isArray(avgAuthor) && avgAuthor.length > 0) {
		const sessionUsername =
			((session?.user as any)?.username as string) ||
			((session?.user as any)?.name as string) ||
			((session?.user as any)?.email as string) ||
			"";

		let match = avgAuthor.find((row: any) => row.authorUsername === sessionUsername);

		if (!match) {
			match = avgAuthor[0];
		}

		if (match) {
			overallAverageCompletionPct = toPctNumber(match.averageCompletionRate);
		}
	}

	const teacherNameGuess =
		((session?.user as any)?.name as string) ||
		((session?.user as any)?.username as string) ||
		((session?.user as any)?.email as string) ||
		"—";

	// LOG: Kurse + erster Kurs + erste Lessons
	if (courses.length > 0) {
		const firstId = courses[0].courseId;
		console.log("[Page] courses after mapping:", courses);
		console.log("[Page] first courseId from courses:", firstId);
		console.log("[Page] lessonsByCourse[firstId]:", lessonsByCourse[firstId]);
		console.log("[Page] perCourseStats[firstId]:", perCourseStats[firstId]);
	}

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
