import { useEffect, useRef, useState } from "react";
import { withTranslations } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { useSession } from "next-auth/react";
import type { Chart as ChartJS } from "chart.js";

/* -------------------------
   Types for dashboard view
------------------------- */
type ModuleItem = { label: string; rate: number };
type CourseItem = { label: string; avg: number };

type DashboardData = {
	teacherName: string;
	studentsCount?: number;
	courses: CourseItem[];
	modules?: ModuleItem[];
	modulesByCourse?: Record<string, ModuleItem[]>;
	overallAverageCompletionPct?: number;
};

// shape from AverageCompletionRateByAuthorByCourse
type CourseRow = {
	id: string;
	courseId: string;
	courseTitle: string;
	authorUsername: string;
	totalEnrollments: number;
	completedEnrollments: number;
	completionRatePercent: number;
};

/* -------------------------
   Helpers
------------------------- */
const pct = (n?: number) =>
	n === undefined || n === null || !Number.isFinite(n) ? "—" : `${Math.round(n)}%`;

const mean = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

const toPct = (v: unknown) => {
	const n = Number(v ?? 0);
	if (!Number.isFinite(n)) return 0;
	return n <= 1 ? Math.round(n * 100) : Math.round(n);
};

// chart colors
const colorGreen = "#7fb89b";
const colorYellow = "#eae282";
const colorRed = "#e57368";
const colorAxis = "#525252";

/* -------------------------
   ChartCard component (mit horizontaler Option)
------------------------- */
function ChartCard({
	title,
	data = [],
	rightArrow,
	onRightArrowClick,
	horizontal = false
}: {
	title: string;
	data?: { label: string; value: number }[];
	rightArrow?: boolean;
	onRightArrowClick?: () => void;
	horizontal?: boolean;
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
							maxBarThickness: horizontal ? 36 : 48
						}
					]
				},
				options: {
					indexAxis: horizontal ? "y" : "x",
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						legend: { display: false },
						tooltip: {
							callbacks: {
								label: ctx =>
									`${ctx.parsed[horizontal ? "x" : "y"]?.toFixed?.(1) ?? 0}%`
							}
						}
					},
					scales: {
						x: horizontal
							? {
									beginAtZero: true,
									max: 100,
									ticks: {
										callback: v => `${v}%`,
										color: colorAxis,
										font: { size: 11 }
									},
									grid: { color: "#e5e7eb" }
								}
							: {
									beginAtZero: true,
									max: 100,
									ticks: {
										callback: v => `${v}%`,
										color: colorAxis,
										font: { size: 11 },
										maxRotation: 0,
										minRotation: 0
									},
									grid: { color: "#e5e7eb" }
								},
						y: horizontal
							? {
									ticks: {
										color: colorAxis,
										font: { size: 11 },
										autoSkip: false
									},
									grid: { display: false }
								}
							: {
									ticks: {
										color: colorAxis,
										font: { size: 11 },
										maxRotation: 0,
										minRotation: 0
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
	}, [data, horizontal]);

	const empty = !data.length;

	return (
		<div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5">
			<div className="px-5 pt-4 pb-2 border-b border-neutral-200 flex items-center justify-between">
				<h2 className="text-lg font-semibold">{title}</h2>

				{rightArrow && (
					<button
						onClick={onRightArrowClick}
						className="inline-flex items-center justify-center h-8 w-8 rounded-full hover:bg-neutral-100"
					>
						<svg
							viewBox="0 0 24 24"
							className="w-4 h-4"
							stroke="currentColor"
							fill="none"
						>
							<path
								d="M9 18l6-6-6-6"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</button>
				)}
			</div>

			<div className="relative p-5" style={{ height: horizontal ? 380 : 360 }}>
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

/* -------------------------
   Dashboard layout
------------------------- */
function AnalyticsDashboard({ data }: { data?: DashboardData }) {
	const [courseIndex, setCourseIndex] = useState(0);

	const courseLabels = (data?.courses ?? []).map(c => c.label);
	const activeCourseLabel = courseLabels[courseIndex] ?? "";

	const currentModules =
		(activeCourseLabel && data?.modulesByCourse?.[activeCourseLabel]) || data?.modules || [];

	const moduleBars = currentModules.map(m => ({ label: m.label, value: m.rate }));
	const courseBars = (data?.courses ?? []).map(c => ({
		label: c.label,
		value: c.avg
	}));

	const avgCompletionSubjects = mean(currentModules.map(m => m.rate));
	const highest = currentModules.reduce(
		(p, c) => (c.rate > p.rate ? c : p),
		currentModules[0] ?? { label: "", rate: 0 }
	);
	const lowest = currentModules.reduce(
		(p, c) => (c.rate < p.rate ? c : p),
		currentModules[0] ?? { label: "", rate: 0 }
	);

	const goNextCourse = () => {
		if (!courseLabels.length) return;
		setCourseIndex(i => (i + 1) % courseLabels.length);
	};

	return (
		<div className="max-w-7xl mx-auto p-6 md:p-8">
			<h1 className="text-3xl font-bold mb-6">
				Willkommen zurück,{" "}
				<span className="text-neutral-700">{data?.teacherName ?? "—"}</span>!
			</h1>

			<section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
				{/* Linkes Chart: Modulraten pro Kurs */}
				<ChartCard
					title={
						courseLabels.length
							? `Completion Rate – ${activeCourseLabel}`
							: `Completion Rate`
					}
					data={moduleBars}
					rightArrow={courseLabels.length > 1}
					onRightArrowClick={goNextCourse}
					horizontal={false}
				/>

				{/* Rechtes Chart: Kurse horizontal */}
				<ChartCard
					title="Average Completion Rate – Courses"
					data={courseBars}
					horizontal={true}
				/>
			</section>

			<section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Analysis */}
				<div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5">
					<div className="px-5 pt-4 pb-2 border-b border-neutral-200 flex items-center gap-2">
						<h3 className="text-lg font-semibold">Analysis</h3>
					</div>
					<div className="p-5 text-sm leading-6 space-y-2">
						<div>
							• Average Completion Rate (Subjects in active course):{" "}
							{pct(avgCompletionSubjects)}
						</div>
						<div>• Number of Students: {data?.studentsCount ?? "—"}</div>
						<div>
							• Highest Completion Rate:{" "}
							{highest.label ? `${highest.label} – ${pct(highest.rate)}` : "—"}
						</div>
						<div>
							• Lowest Completion Rate:{" "}
							{lowest.label ? `${lowest.label} – ${pct(lowest.rate)}` : "—"}
						</div>
					</div>
				</div>

				{/* Overview */}
				<div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5">
					<div className="px-5 pt-4 pb-2 border-b border-neutral-200 flex items-center gap-2">
						<h3 className="text-lg font-semibold">Overview</h3>
					</div>
					<div className="p-5 text-sm leading-6">
						Average Completion Rate: <b>{pct(data?.overallAverageCompletionPct)}</b>
					</div>
				</div>
			</section>
		</div>
	);
}

/* -------------------------
   SSR wrapper
------------------------- */
export const getServerSideProps = withTranslations(["common"]);

/* -------------------------
   Page component
------------------------- */
export default function LearningAnalyticsPage() {
	const { data: session, status } = useSession();

	const { data: coursesApi } =
		trpc.metrics.getUserAverageCompletionRateByAuthorByCourse.useQuery(undefined);
	const { data: authorApi } =
		trpc.metrics.getUserAverageCompletionRateByAuthor.useQuery(undefined);
	const { data: courseSubjectApi } =
		trpc.metrics.getUserCoursesCompletedBySubject.useQuery(undefined);

	if (status === "loading") {
		return <div className="p-10 text-neutral-600">Lade Session …</div>;
	}

	/* ---- Kursdaten aufbereiten ---- */
	const coursesRows: CourseRow[] = Array.isArray(coursesApi) ? (coursesApi as any[]) : [];

	const courses: CourseItem[] = coursesRows
		.map(row => ({
			label: row.courseTitle ?? "—",
			avg: toPct(row.completionRatePercent)
		}))
		.filter(c => !!c.label && Number.isFinite(c.avg));

	/* ---- Module/Subjects ---- */
	const subjArr = Array.isArray(courseSubjectApi) ? (courseSubjectApi as any[]) : [];

	const modulesByCourse: Record<string, ModuleItem[]> = {};
	subjArr.forEach(row => {
		const courseName =
			row.courseLabel ?? row.courseName ?? row.courseSlug ?? row.courseTitle ?? "—";

		const subjectName =
			row.subjectLabel ??
			row.subjectName ??
			row.subject ??
			row.moduleName ??
			row.title ??
			"Module";

		let subjectCompletionRaw =
			row.completionRatePercent ??
			row.average ??
			row.avg ??
			row.completionRate ??
			row.completedRate ??
			row.percentage ??
			row.rate;

		if (
			subjectCompletionRaw == null &&
			row.totalEnrollments != null &&
			row.completedEnrollments != null
		) {
			subjectCompletionRaw =
				row.totalEnrollments > 0
					? (row.completedEnrollments / row.totalEnrollments) * 100
					: 0;
		}

		const rate = toPct(subjectCompletionRaw);
		(modulesByCourse[courseName] ??= []).push({ label: subjectName, rate });
	});

	/* ---- Overview ---- */
	let totalAll = 0;
	let completedAll = 0;
	for (const row of coursesRows) {
		totalAll += Number(row.totalEnrollments ?? 0);
		completedAll += Number(row.completedEnrollments ?? 0);
	}
	const weightedPct = totalAll === 0 ? 0 : (completedAll / totalAll) * 100;
	const overallAverageCompletionPct = toPct(weightedPct);

	const studentsCount = totalAll;
	const teacherNameGuess =
		((session?.user as any)?.name as string) ||
		((session?.user as any)?.username as string) ||
		((session?.user as any)?.email as string) ||
		"—";

	const dashboardData: DashboardData | undefined = courses.length
		? {
				teacherName: teacherNameGuess,
				studentsCount,
				courses,
				modulesByCourse,
				overallAverageCompletionPct
			}
		: undefined;

	/* ---- Render ---- */
	return (
		<div className="bg-neutral-50 min-h-screen relative">
			<AnalyticsDashboard data={dashboardData} />
		</div>
	);
}
