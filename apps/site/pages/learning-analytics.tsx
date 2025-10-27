import { useEffect, useRef, useState } from "react";
import { withTranslations } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { useSession } from "next-auth/react";
import type { Chart as ChartJS } from "chart.js";

/* ---------- Helpers ---------- */

// Prozent hübsch anzeigen
// Wenn du lieber ganze Zahlen willst (8 statt 8.3), mach toFixed(0).
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

type LessonItem = { label: string; rate: number };

type CourseItem = {
	courseId: string;
	label: string; // courseTitle
	rate: number; // averageCompletionRate (%)
	enrollments: number; // totalEnrollments
};

type PerCourseStats = {
	avgCourseRate?: number; // aus der Aggregation je Kurs
	numberOfStudents?: number; // totalLessonsStarted oder totalEnrollments
	highestLessonName?: string;
	highestLessonRate?: number;
	lowestLessonName?: string;
	lowestLessonRate?: number;
};

type DashboardData = {
	teacherName: string;
	courses: CourseItem[]; // für rechtes Chart + Kurswechsel
	lessonsByCourse: Record<string, LessonItem[]>; // courseId -> Lessons
	perCourseStats: Record<string, PerCourseStats>; // courseId -> Analysis Box
	overallAverageCompletionPct?: number; // Overall (Overview Box)
};

/* ---------- ChartCard (immer horizontal) ---------- */

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

	// Chart-Daten für Lessons (linkes Chart)
	const lessonBars = activeLessons.map(lesson => ({
		label: lesson.label,
		value: lesson.rate
	}));

	// Chart-Daten für Kurse (rechtes Chart)
	const courseBars = courses.map(c => ({
		label: c.label,
		value: c.rate
	}));

	const goNextCourse = () => {
		if (!courses.length) return;
		setCoursePos(i => (i + 1) % courses.length);
	};

	return (
		<div className="max-w-7xl mx-auto p-6 md:p-8">
			<h1 className="text-3xl font-bold mb-6">
				Willkommen zurück,{" "}
				<span className="text-neutral-700">{data?.teacherName ?? "—"}</span>!
			</h1>

			<section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
				{/* Linkes Chart: Completion Rates je Lesson für den aktuell ausgewählten Kurs */}
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
								className="text-xs text-neutral-600 bg-white/80 rounded-lg border border-neutral-300 px-2 py-1 hover:bg-neutral-100"
							>
								Nächster Kurs →
							</button>
						)
					}
				/>

				{/* Rechtes Chart: Average Completion Rate nach Kurs */}
				<ChartCard title="Average Completion Rate – Courses" data={courseBars} />
			</section>

			<section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Analysis Box (links unten) */}
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

				{/* Overview Box (rechts unten, global) */}
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
		</div>
	);
}

/* ---------- SSR Wrapper ---------- */
export const getServerSideProps = withTranslations(["common"]);

/* ---------- Page Component (Data Wiring) ---------- */

export default function LearningAnalyticsPage() {
	const { data: session, status } = useSession();

	// 1. Overall pro Author (Overview unten rechts)
	const { data: avgAuthor } =
		trpc.metrics.getAuthorMetric_AverageCompletionRate.useQuery(undefined);

	// 2. Kurse (rechtes Chart + Basis für Kurswechsel)
	const { data: avgCourse } =
		trpc.metrics.getAuthorMetric_AverageCourseCompletionRate.useQuery(undefined);

	// 3. Lessons/Topics je Kurs (linkes Chart + High/Low)
	//    WICHTIG: Diese View muss courseId + courseTitle + lessonTitle + averageCompletionRate liefern,
	//    sonst können wir nicht pro Kurs filtern.
	const { data: avgLessonByCourse } =
		trpc.metrics.getAuthorMetric_AverageLessonCompletionRateByCourse.useQuery(undefined);

	// 4. Pro-Kurs-Aggregation (Analysis Box: avgCourseRate, numberOfStudents)
	//    Falls das dieselbe Query ist wie (3), kannst du eine davon weglassen.
	const { data: avgLessonByCourseAgg } =
		trpc.metrics.getAuthorMetric_AverageLessonCompletionRateByCourse.useQuery(undefined);

	if (status === "loading") {
		return <div className="p-10 text-neutral-600">Lade Session …</div>;
	}

	/* --- 2. Kurse vorbereiten (rechtes Diagramm) --- */

	const coursesRaw: any[] = Array.isArray(avgCourse) ? avgCourse : [];

	const courses: CourseItem[] = coursesRaw.map(row => ({
		courseId: row.courseId ?? row.coursed ?? row.courseID ?? "—",
		label: row.courseTitle ?? row.courseName ?? "—",
		rate: toPctNumber(row.averageCompletionRate), // <- deine echte Spalte
		enrollments: Number(row.totalEnrollments ?? 0)
	}));

	/* --- 3. Lessons nach Kurs vorbereiten (linkes Diagramm + High/Low) --- */

	const lessonsRaw: any[] = Array.isArray(avgLessonByCourse) ? avgLessonByCourse : [];

	// courseId -> array of lessons
	const lessonsByCourse: Record<string, LessonItem[]> = {};
	// courseId -> track high/low
	const perCourseHiLo: Record<string, { max?: LessonItem; min?: LessonItem }> = {};

	for (const row of lessonsRaw) {
		// Wichtig: Backend muss courseId mitliefern
		const cId = row.courseId ?? row.coursed ?? "—";

		const lessonName = row.lessonTitle ?? row.lessonId ?? "Lesson";
		const lessonRate = toPctNumber(row.averageCompletionRate);

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
	}

	/* --- 4. Per-Kurs-Aggregate vorbereiten (Analysis Box) --- */

	const aggRows: any[] = Array.isArray(avgLessonByCourseAgg) ? avgLessonByCourseAgg : [];

	const perCourseStats: Record<string, PerCourseStats> = {};

	for (const row of aggRows) {
		const cId = row.courseId ?? row.coursed ?? "—";

		perCourseStats[cId] = {
			avgCourseRate: toPctNumber(
				// z. B. "averageCourseCompletionRate" oder "averageCompletionRate"
				row.averageCourseCompletionRate ?? row.averageCompletionRate ?? row.avg
			),
			numberOfStudents: Number(
				// du meintest: "Number of Students" = totalLessonsStarted,
				// falls das nicht da ist -> totalEnrollments
				row.totalLessonsStarted ?? row.totalEnrollments ?? 0
			)
		};
	}

	// merge High / Low Lesson Completion je Kurs rein
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

	/* --- 1. Overview (Overall Completion Rate) --- */

	let overallAverageCompletionPct: number | undefined = undefined;

	if (Array.isArray(avgAuthor) && avgAuthor.length > 0) {
		// wir matchen ausschließlich über authorUsername
		const sessionUsername =
			((session?.user as any)?.username as string) ||
			((session?.user as any)?.name as string) ||
			((session?.user as any)?.email as string) ||
			"";

		let match = avgAuthor.find((row: any) => row.authorUsername === sessionUsername);

		// Fallback: falls dein Session-Username nicht exakt so heißt
		if (!match) {
			match = avgAuthor[0];
		}

		if (match) {
			// Spalte in deiner Tabelle:
			// averageCompletionRate
			overallAverageCompletionPct = toPctNumber(match.averageCompletionRate);
		}
	}

	/* --- teacherName aus Session für Begrüßung --- */

	const teacherNameGuess =
		((session?.user as any)?.name as string) ||
		((session?.user as any)?.username as string) ||
		((session?.user as any)?.email as string) ||
		"—";

	/* --- DashboardData zusammenbauen --- */

	const dashboardData: DashboardData | undefined = courses.length
		? {
				teacherName: teacherNameGuess,
				courses,
				lessonsByCourse,
				perCourseStats,
				overallAverageCompletionPct
			}
		: undefined;

	/* --- Render --- */

	return (
		<div className="bg-neutral-50 min-h-screen relative">
			<AnalyticsDashboard data={dashboardData} />
		</div>
	);
}
