import { useEffect, useMemo, useRef, useState } from "react";
import { withTranslations } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { useSession } from "next-auth/react";
import type { Chart as ChartJS, Tick } from "chart.js";

type ModuleItem = { label: string; rate: number };
type CourseItem = { label: string; avg: number };
type DashboardData = {
	teacherName: string;
	studentsCount?: number;
	courses: CourseItem[];
	modules?: ModuleItem[];
	modulesByCourse?: Record<string, ModuleItem[]>; // Kurs → Module
};

type BarPoint = { label: string; value: number };

const pct = (n: number) => `${Math.round(n)}%`;
const mean = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

const toPct = (v: unknown): number => {
	const n = Number(v ?? 0);
	if (!Number.isFinite(n)) return 0;
	return n <= 1 ? Math.round(n * 100) : Math.round(n);
};

type CourseApi = {
	courseLabel?: string;
	courseName?: string;
	courseSlug?: string;
	title?: string;
	name?: string;
	average?: number;
	avg?: number;
	completionRate?: number;
	percentage?: number;
	rate?: number;
};

type SubjectApi = {
	courseLabel?: string;
	courseName?: string;
	courseSlug?: string;
	courseTitle?: string;
	subjectLabel?: string;
	subjectName?: string;
	subject?: string;
	moduleName?: string;
	title?: string;
	average?: number;
	avg?: number;
	completionRate?: number;
	completedRate?: number;
	percentage?: number;
	rate?: number;
};

// ---------- visuals ----------
const colorGreen = "#7fb89b";
const colorYellow = "#eae282";
const colorRed = "#e57368";
const colorAxis = "#525252";

function ChartCard({
	title,
	data = [],
	max = 100,
	className = "",
	rightArrow,
	onRightArrowClick
}: {
	title: string;
	data?: BarPoint[];
	max?: number;
	className?: string;
	rightArrow?: boolean;
	onRightArrowClick?: () => void;
}) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const chartRef = useRef<ChartJS | null>(null);

	useEffect(() => {
		let isMounted = true;

		(async () => {
			try {
				const { default: Chart } = await import("chart.js/auto");

				const labels = data.map(d => d.label);
				const values = data.map(d => d.value);
				const colors = values.map(v =>
					v >= 70 ? colorGreen : v >= 40 ? colorYellow : colorRed
				);

				chartRef.current?.destroy();
				if (!isMounted || !canvasRef.current) return;

				chartRef.current = new Chart(canvasRef.current, {
					type: "bar",
					data: {
						labels,
						datasets: [
							{
								data: values,
								backgroundColor: colors.length ? colors : undefined,
								borderRadius: 8,
								maxBarThickness: 48
							}
						]
					},
					options: {
						responsive: true,
						maintainAspectRatio: false,
						plugins: { legend: { display: false } },
						scales: {
							y: {
								beginAtZero: true,
								max,
								ticks: {
									// Signatur passend zu Chart.js-Typen
									callback: (
										value: string | number,
										_index: number,
										_ticks: Tick[]
									) => `${value}%`,
									color: colorAxis
								},
								grid: { color: "#e5e7eb" }
							},
							x: { ticks: { color: colorAxis }, grid: { display: false } }
						}
					}
				});
			} catch (err) {
				console.error("Chart.js Chunk konnte nicht geladen werden:", err);
			}
		})();

		return () => {
			isMounted = false;
			chartRef.current?.destroy();
		};
	}, [data, max]);

	const isEmpty = !data || data.length === 0;

	return (
		<div className={`bg-white rounded-2xl shadow-sm ring-1 ring-black/5 ${className}`}>
			<div className="px-5 pt-4 pb-2 border-b border-neutral-200 flex items-center justify-between">
				<h2 className="text-lg font-semibold">{title}</h2>
				{rightArrow && (
					<button
						type="button"
						onClick={onRightArrowClick}
						className="inline-flex items-center justify-center h-8 w-8 rounded-full hover:bg-neutral-100 active:bg-neutral-200 transition"
						aria-label="Next course"
						title="Next course"
					>
						<svg
							viewBox="0 0 24 24"
							className="w-4 h-4 text-neutral-700"
							fill="none"
							stroke="currentColor"
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

			<div className="relative p-5" style={{ height: 360 }}>
				<canvas ref={canvasRef} />
				{isEmpty && (
					<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
						<div className="text-sm text-neutral-500">No data yet</div>
					</div>
				)}
			</div>
		</div>
	);
}

type Computed = {
	avgCompletion?: number;
	highest?: ModuleItem;
	lowest?: ModuleItem;
	avgCourse?: number;
	bestCourse?: CourseItem;
	worstCourse?: CourseItem;
	deltaBest?: number;
	deltaWorst?: number;
};

function AnalyticsDashboard({ data }: { data?: DashboardData }) {
	const [courseIndex, setCourseIndex] = useState(0);

	const courseLabels = (data?.courses ?? []).map(c => c.label);
	const activeCourseLabel = courseLabels[courseIndex] ?? "";

	let currentModules: ModuleItem[] = [];
	if (activeCourseLabel && data?.modulesByCourse?.[activeCourseLabel]) {
		currentModules = data.modulesByCourse[activeCourseLabel]!;
	} else if (data?.modules) {
		currentModules = data.modules;
	}

	const moduleBars: BarPoint[] = currentModules.map(m => ({ label: m.label, value: m.rate }));
	const courseBars: BarPoint[] = (data?.courses ?? []).map(c => ({
		label: c.label,
		value: c.avg
	}));

	const computed: Computed = useMemo(() => {
		if (!data) return {};
		const allModules = currentModules;
		const avgCompletion = mean(allModules.map(m => m.rate));
		const highest = allModules.length
			? allModules.reduce((p, c) => (c.rate > p.rate ? c : p))
			: (undefined as unknown as ModuleItem);
		const lowest = allModules.length
			? allModules.reduce((p, c) => (c.rate < p.rate ? c : p))
			: (undefined as unknown as ModuleItem);

		const avgCourse = mean((data.courses ?? []).map(c => c.avg));
		const bestCourse = (data.courses ?? []).reduce(
			(p, c) => (c.avg > p.avg ? c : p),
			(data.courses ?? [])[0]
		);
		const worstCourse = (data.courses ?? []).reduce(
			(p, c) => (c.avg < p.avg ? c : p),
			(data.courses ?? [])[0]
		);
		const deltaBest = bestCourse && avgCourse ? Math.round(bestCourse.avg - avgCourse) : 0;
		const deltaWorst = worstCourse && avgCourse ? Math.round(avgCourse - worstCourse.avg) : 0;

		return {
			avgCompletion,
			highest,
			lowest,
			avgCourse,
			bestCourse,
			worstCourse,
			deltaBest,
			deltaWorst
		};
	}, [data, currentModules]);

	const goNextCourse = () => {
		if (!courseLabels.length) return;
		setCourseIndex(i => (i + 1) % courseLabels.length);
	};

	return (
		<div className="max-w-7xl mx-auto p-6 md:p-8">
			<h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
				Willkommen zurück,{" "}
				<span className="text-neutral-700">{data?.teacherName ?? "—"}</span>!
			</h1>

			{/* Charts */}
			<section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
				<ChartCard
					title={
						courseLabels.length
							? `Completion Rate – ${activeCourseLabel}`
							: `Completion Rate`
					}
					data={moduleBars}
					rightArrow={courseLabels.length > 1}
					onRightArrowClick={goNextCourse}
				/>

				<ChartCard title="Average Completion Rate – Courses" data={courseBars} />
			</section>

			{/* Info-Boxen */}
			<section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Analysis */}
				<div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5">
					<div className="px-5 pt-4 pb-2 border-b border-neutral-200 flex items-center gap-2">
						<svg
							className="w-5 h-5 text-neutral-600"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M11 3a1 1 0 011 1v12a1 1 0 01-2 0V4a1 1 0 011-1zm-6 6a1 1 0 011 1v6a1 1 0 11-2 0v-6a1 1 0 011-1zm12-4a1 1 0 011 1v10a1 1 0 11-2 0V6a1 1 0 011-1zm4 8a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1z"
							/>
						</svg>
						<h3 className="text-lg font-semibold">Analysis</h3>
					</div>
					<div className="p-5">
						<ul className="space-y-2 text-sm leading-6">
							<li>
								• Average Completion Rate:{" "}
								{computed.avgCompletion !== undefined
									? pct(computed.avgCompletion)
									: "—"}
							</li>
							<li>• Number of Students: {data?.studentsCount ?? "—"}</li>
							<li>
								• Highest Completion Rate (Top-Module):{" "}
								{computed.highest
									? `${computed.highest.label} – ${pct(computed.highest.rate)}`
									: "—"}
							</li>
							<li>
								• Lowest Completion Rate (Low-Module):{" "}
								{computed.lowest
									? `${computed.lowest.label} – ${pct(computed.lowest.rate)}`
									: "—"}
							</li>
						</ul>
					</div>
				</div>

				{/* Overview */}
				<div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5">
					<div className="px-5 pt-4 pb-2 border-b border-neutral-200 flex items-center gap-2">
						<svg
							className="w-5 h-5 text-neutral-600"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M9 12l2 2 4-4M7 20h10a2 2 0 002-2V8l-6-5H7a2 2 0 00-2 2v13a2 2 0 002 2z"
							/>
						</svg>
						<h3 className="text-lg font-semibold">Overview</h3>
					</div>
					<div className="p-5">
						<ul className="space-y-3 text-sm leading-6">
							<li>
								{computed.bestCourse ? (
									<>
										The course <b>{computed.bestCourse.label}</b> performs
										significantly above average with{" "}
										<b>{pct(computed.bestCourse.avg)}</b> (
										{(computed.deltaBest ?? 0) >= 0 ? "+" : ""}
										{computed.deltaBest ?? 0} pp).
									</>
								) : (
									"—"
								)}
							</li>
							<li>
								{computed.avgCourse !== undefined && data?.courses?.length ? (
									<>
										{data.courses[0]?.label ?? "—"} (
										{data.courses[0] ? pct(data.courses[0].avg) : "—"}) and{" "}
										{data.courses[3]?.label ?? "—"} (
										{data.courses[3] ? pct(data.courses[3].avg) : "—"}) are
										close to the average ({pct(computed.avgCourse)}).
									</>
								) : (
									"—"
								)}
							</li>
							<li>
								{computed.worstCourse ? (
									<>
										{computed.worstCourse.label} reaches only{" "}
										<b>{pct(computed.worstCourse.avg)}</b>, which is{" "}
										{computed.deltaWorst ?? 0} pp below the average, indicating
										difficulties.
									</>
								) : (
									"—"
								)}
							</li>
						</ul>
					</div>
				</div>
			</section>
		</div>
	);
}

export const getServerSideProps = withTranslations(["common"]);

//Daten
export default function LearningAnalyticsPage() {
	const { data: session, status } = useSession();

	const authorName = (session?.user?.name ?? "").trim();

	const {
		data: coursesApi,
		isLoading: loadingCourses,
		error: coursesError
	} = trpc.metrics.getUserAverageCompletionRateByAuthorByCourse.useQuery(authorName, {
		enabled: !!authorName
	});

	const {
		data: authorApi,
		isLoading: loadingAuthor,
		error: authorError
	} = trpc.metrics.getUserAverageCompletionRateByAuthor.useQuery(authorName, {
		enabled: !!authorName
	});

	const {
		data: subjectsApi,
		isLoading: loadingSubjects,
		error: subjectsError
	} = trpc.metrics.getUserAverageCompletionRateByAuthorBySubject.useQuery(authorName, {
		enabled: !!authorName
	});

	const coursesApiArr = (Array.isArray(coursesApi) ? coursesApi : []) as CourseApi[];
	const courses: CourseItem[] = coursesApiArr
		.map(c => ({
			label: c.courseLabel ?? c.courseName ?? c.courseSlug ?? c.title ?? c.name ?? "—",
			avg: toPct(c.average ?? c.avg ?? c.completionRate ?? c.percentage ?? c.rate)
		}))
		.filter(c => !!c.label && Number.isFinite(c.avg));

	const subjectsApiArr = (Array.isArray(subjectsApi) ? subjectsApi : []) as SubjectApi[];
	let modulesByCourse: Record<string, ModuleItem[]> | undefined;
	let modules: ModuleItem[] | undefined;

	if (subjectsApiArr.length) {
		const hasCourseInfo = subjectsApiArr.some(
			s => s.courseLabel || s.courseName || s.courseSlug || s.courseTitle
		);

		if (hasCourseInfo) {
			modulesByCourse = subjectsApiArr.reduce((acc: Record<string, ModuleItem[]>, s) => {
				const course =
					s.courseLabel ?? s.courseName ?? s.courseSlug ?? s.courseTitle ?? "—";
				const subjectLabel =
					s.subjectLabel ??
					s.subjectName ??
					s.subject ??
					s.moduleName ??
					s.title ??
					"Module";
				const rate = toPct(
					s.average ??
						s.avg ??
						s.completionRate ??
						s.completedRate ??
						s.percentage ??
						s.rate
				);
				(acc[course] ??= []).push({ label: subjectLabel, rate });
				return acc;
			}, {});
		} else {
			modules = subjectsApiArr.map(s => ({
				label:
					s.subjectLabel ??
					s.subjectName ??
					s.subject ??
					s.moduleName ??
					s.title ??
					"Module",
				rate: toPct(
					s.average ??
						s.avg ??
						s.completionRate ??
						s.completedRate ??
						s.percentage ??
						s.rate
				)
			}));
		}
	}

	// Meta: sichtbarer Name im Dashboard
	const teacherName = (session?.user?.name && session.user.name.trim()) || "—";
	const studentsCount: number | undefined = (authorApi as any)?.studentsCount ?? undefined;

	const dashboardData: DashboardData | undefined = courses.length
		? {
				teacherName,
				studentsCount,
				courses,
				...(modulesByCourse ? { modulesByCourse } : {}),
				...(modules ? { modules } : {})
			}
		: undefined;

	// UI-States
	if (status === "loading" || (!authorName && status !== "unauthenticated")) {
		return (
			<div className="bg-neutral-50 min-h-screen">
				<div className="max-w-7xl mx-auto p-6 md:p-8 text-neutral-600">Lade Session …</div>
			</div>
		);
	}

	if (!authorName) {
		return (
			<div className="bg-neutral-50 min-h-screen">
				<div className="max-w-7xl mx-auto p-6 md:p-8 text-neutral-600">
					Kein eingeloggter User gefunden – bitte anmelden.
				</div>
			</div>
		);
	}

	if (loadingCourses || loadingAuthor || loadingSubjects) {
		return (
			<div className="bg-neutral-50 min-h-screen">
				<div className="max-w-7xl mx-auto p-6 md:p-8 text-neutral-600">Lädt Daten …</div>
			</div>
		);
	}

	if (coursesError || authorError || subjectsError) {
		return (
			<div className="bg-neutral-50 min-h-screen">
				<div className="max-w-7xl mx-auto p-6 md:p-8 text-red-600">
					Fehler beim Laden der Analytics:
					<pre className="mt-2 text-sm text-red-800 bg-red-50 p-3 rounded-lg overflow-auto">
						{String(coursesError ?? authorError ?? subjectsError)}
					</pre>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-neutral-50 min-h-screen">
			<AnalyticsDashboard data={dashboardData} />
		</div>
	);
}
