import { useEffect, useMemo, useRef, useState } from "react";
import { withTranslations } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { useSession } from "next-auth/react";
import type { Chart as ChartJS, Tick } from "chart.js";

// --------------------------------------
// Hilfsfunktionen & generische Typen
// --------------------------------------

type ModuleItem = { label: string; rate: number };
type CourseItem = { label: string; avg: number };

type DashboardData = {
	teacherName: string;
	studentsCount?: number;
	courses: CourseItem[];
	modules?: ModuleItem[];
	modulesByCourse?: Record<string, ModuleItem[]>; // Kurs → Subjects/Module
	overallAverageCompletionPct?: number; // <- NEU für die Overview-Box
};

type BarPoint = { label: string; value: number };

const pct = (n: number | undefined) => {
	if (n === undefined || n === null || !Number.isFinite(n)) return "—";
	return `${Math.round(n)}%`;
};

const mean = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

const toPct = (v: unknown): number => {
	const n = Number(v ?? 0);
	if (!Number.isFinite(n)) return 0;
	return n <= 1 ? Math.round(n * 100) : Math.round(n);
};

// --------------------------------------
// Rohdaten-Typen aus den Queries
// --------------------------------------

// Für das rechte Diagramm (Kurs-Completion)
type CourseApi = {
	courseLabel?: string;
	courseName?: string;
	courseSlug?: string;
	courseTitle?: string; // aus DB Screenshot
	title?: string;
	name?: string;

	totalEnrollments?: number; // aus DB Screenshot
	completedEnrollments?: number; // aus DB Screenshot

	average?: number;
	avg?: number;
	completionRate?: number;
	percentage?: number;
	rate?: number;
};

// Für das linke Diagramm (Subjects/Module pro Kurs)
type CourseSubjectCompletionApi = {
	courseLabel?: string;
	courseName?: string;
	courseSlug?: string;
	courseTitle?: string;

	subjectLabel?: string;
	subjectName?: string;
	subject?: string;
	moduleName?: string;
	title?: string;

	totalEnrollments?: number;
	completedEnrollments?: number;

	average?: number;
	avg?: number;
	completionRate?: number;
	completedRate?: number;
	percentage?: number;
	rate?: number;
};

// --------------------------------------
// Farben (Charts)
// --------------------------------------

const colorGreen = "#7fb89b";
const colorYellow = "#eae282";
const colorRed = "#e57368";
const colorAxis = "#525252";

// --------------------------------------
// ChartCard-Komponente (Balkendiagramm)
// --------------------------------------

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

				// altes Chart zerstören, dann neu aufbauen
				chartRef.current?.destroy();
				if (!isMounted || !canvasRef.current) return;

				chartRef.current = new Chart(canvasRef.current, {
					type: "bar",
					data: {
						labels,
						datasets: [
							{
								data: values,
								backgroundColor: colors,
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
									callback: (value: string | number) => `${value}%`,
									color: colorAxis
								},
								grid: { color: "#e5e7eb" }
							},
							x: {
								ticks: { color: colorAxis },
								grid: { display: false }
							}
						}
					}
				});
			} catch (err) {
				console.error("Chart.js konnte nicht geladen werden:", err);
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

// --------------------------------------
// Dashboard-Komponente (Charts + Boxen)
// --------------------------------------

function AnalyticsDashboard({ data }: { data?: DashboardData }) {
	const [courseIndex, setCourseIndex] = useState(0);

	// Liste aller Kurse (für Pfeil-Navigation links)
	const courseLabels = (data?.courses ?? []).map(c => c.label);
	const activeCourseLabel = courseLabels[courseIndex] ?? "";

	// Subjects/Module für den aktuell aktiven Kurs
	let currentModules: ModuleItem[] = [];
	if (activeCourseLabel && data?.modulesByCourse?.[activeCourseLabel]) {
		currentModules = data.modulesByCourse[activeCourseLabel]!;
	} else if (data?.modules) {
		currentModules = data.modules;
	}

	// Linkes Chart (Completion pro Subject)
	const moduleBars: BarPoint[] = currentModules.map(m => ({
		label: m.label,
		value: m.rate
	}));

	// Rechtes Chart (Average Completion pro Kurs)
	const courseBars: BarPoint[] = (data?.courses ?? []).map(c => ({
		label: c.label,
		value: c.avg
	}));

	// Kennzahlen für Analysis-Box
	const avgCompletionSubjects = mean(currentModules.map(m => m.rate));

	const highest = currentModules.reduce(
		(p, c) => (c.rate > p.rate ? c : p),
		currentModules[0] ?? { label: "", rate: 0 }
	);

	const lowest = currentModules.reduce(
		(p, c) => (c.rate < p.rate ? c : p),
		currentModules[0] ?? { label: "", rate: 0 }
	);

	// Pfeilnavigation zwischen Kursen
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
				{/* Analysis (links unten) */}
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
								• Average Completion Rate (Subjects in active course):{" "}
								{pct(avgCompletionSubjects)}
							</li>
							<li>• Number of Students: {data?.studentsCount ?? "—"}</li>
							<li>
								• Highest Completion Rate (Top-Module):{" "}
								{highest.label ? `${highest.label} – ${pct(highest.rate)}` : "—"}
							</li>
							<li>
								• Lowest Completion Rate (Low-Module):{" "}
								{lowest.label ? `${lowest.label} – ${pct(lowest.rate)}` : "—"}
							</li>
						</ul>
					</div>
				</div>

				{/* Overview (rechts unten) */}
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
								Average Completion Rate:{" "}
								<b>{pct(data?.overallAverageCompletionPct)}</b>
							</li>
						</ul>
					</div>
				</div>
			</section>
		</div>
	);
}

// --------------------------------------
// i18n (SSR Wrapper)
// --------------------------------------

export const getServerSideProps = withTranslations(["common"]);

// --------------------------------------
// Hauptseite
// --------------------------------------

export default function LearningAnalyticsPage() {
	const { data: session, status } = useSession();

	// Name des eingeloggten Users → wird an die Queries übergeben
	const authorName = (session?.user?.name ?? "").trim();

	// 1. Rechtes Chart: durchschnittliche Completion pro Kurs
	const {
		data: coursesApi,
		isLoading: loadingCourses,
		error: coursesError
	} = trpc.metrics.getUserAverageCompletionRateByAuthorByCourse.useQuery(authorName, {
		enabled: !!authorName
	});

	// 2. Author-Daten (z. B. Students Count + overall averageCompletionP)
	const {
		data: authorApi,
		isLoading: loadingAuthor,
		error: authorError
	} = trpc.metrics.getUserAverageCompletionRateByAuthor.useQuery(authorName, {
		enabled: !!authorName
	});

	// 3. Linkes Chart: Completion pro Subject innerhalb jedes Kurses
	const {
		data: courseSubjectApi,
		isLoading: loadingCourseSubjects,
		error: courseSubjectError
	} = trpc.metrics.getUserCoursesCompletedBySubject.useQuery(authorName, {
		enabled: !!authorName
	});

	// ------------------------------
	// Kurse (rechtes Diagramm)
	// ------------------------------

	const coursesApiArr = (Array.isArray(coursesApi) ? coursesApi : []) as CourseApi[];

	const courses: CourseItem[] = coursesApiArr
		.map(c => {
			// Kursname bestimmen
			const label =
				c.courseLabel ??
				c.courseName ??
				c.courseSlug ??
				c.courseTitle ??
				c.title ??
				c.name ??
				"—";

			// zuerst schauen, ob eine fertige Rate existiert
			let completionRaw = c.average ?? c.avg ?? c.completionRate ?? c.percentage ?? c.rate;

			// wenn nicht, aus completed/total berechnen
			if (
				(completionRaw === undefined || completionRaw === null) &&
				c.totalEnrollments !== undefined &&
				c.completedEnrollments !== undefined
			) {
				if (c.totalEnrollments > 0) {
					completionRaw = (c.completedEnrollments / c.totalEnrollments) * 100;
				} else {
					completionRaw = 0;
				}
			}

			const avg = toPct(completionRaw);

			return {
				label,
				avg
			};
		})
		.filter(c => !!c.label && Number.isFinite(c.avg));

	// ------------------------------
	// Subjects / Module pro Kurs (linkes Diagramm)
	// ------------------------------

	const courseSubjectArr = (
		Array.isArray(courseSubjectApi) ? courseSubjectApi : []
	) as CourseSubjectCompletionApi[];

	const modulesByCourse: Record<string, ModuleItem[]> = {};

	courseSubjectArr.forEach(row => {
		const courseName =
			row.courseLabel ?? row.courseName ?? row.courseSlug ?? row.courseTitle ?? "—";

		const subjectName =
			row.subjectLabel ??
			row.subjectName ??
			row.subject ??
			row.moduleName ??
			row.title ??
			"Module";

		// fertige Rate?
		let subjectCompletionRaw =
			row.average ??
			row.avg ??
			row.completionRate ??
			row.completedRate ??
			row.percentage ??
			row.rate;

		// falls nicht vorhanden → berechnen
		if (
			(subjectCompletionRaw === undefined || subjectCompletionRaw === null) &&
			row.totalEnrollments !== undefined &&
			row.completedEnrollments !== undefined
		) {
			if (row.totalEnrollments > 0) {
				subjectCompletionRaw = (row.completedEnrollments / row.totalEnrollments) * 100;
			} else {
				subjectCompletionRaw = 0;
			}
		}

		const rate = toPct(subjectCompletionRaw);

		(modulesByCourse[courseName] ??= []).push({
			label: subjectName,
			rate
		});
	});

	// ------------------------------
	// Overall Average Completion Rate (Overview Box)
	// Screenshot zeigt: authorApi.averageCompletionP = 37.50
	// Wir runden sie über toPct() in ein Prozentformat.
	// ------------------------------

	const overallAverageCompletionPct = toPct(
		(authorApi as any)?.averageCompletionP ??
			(authorApi as any)?.averageCompletion ??
			(authorApi as any)?.avg ??
			(authorApi as any)?.completionRate ??
			(authorApi as any)?.percentage ??
			(authorApi as any)?.rate
	);

	// ------------------------------
	// DashboardData zusammenbauen
	// ------------------------------

	const teacherName = authorName || "—";
	const studentsCount: number | undefined = (authorApi as any)?.studentsCount;

	const dashboardData: DashboardData | undefined = courses.length
		? {
				teacherName,
				studentsCount,
				courses,
				modulesByCourse,
				overallAverageCompletionPct
			}
		: undefined;

	// ------------------------------
	// Lade-/Fehlerzustände
	// ------------------------------

	// Session lädt noch oder wir kennen den Namen noch nicht sicher
	if (status === "loading" || (!authorName && status !== "unauthenticated")) {
		return (
			<div className="bg-neutral-50 min-h-screen">
				<div className="max-w-7xl mx-auto p-6 md:p-8 text-neutral-600">Lade Session …</div>
			</div>
		);
	}

	// Kein User → Hinweis
	if (!authorName) {
		return (
			<div className="bg-neutral-50 min-h-screen">
				<div className="max-w-7xl mx-auto p-6 md:p-8 text-neutral-600">
					Kein eingeloggter User gefunden – bitte anmelden.
				</div>
			</div>
		);
	}

	// Daten werden geladen
	if (loadingCourses || loadingAuthor || loadingCourseSubjects) {
		return (
			<div className="bg-neutral-50 min-h-screen">
				<div className="max-w-7xl mx-auto p-6 md:p-8 text-neutral-600">Lädt Daten …</div>
			</div>
		);
	}

	// Fehler
	if (coursesError || authorError || courseSubjectError) {
		return (
			<div className="bg-neutral-50 min-h-screen">
				<div className="max-w-7xl mx-auto p-6 md:p-8 text-red-600">
					Fehler beim Laden der Analytics:
					<pre className="mt-2 text-sm text-red-800 bg-red-50 p-3 rounded-lg overflow-auto">
						{String(coursesError ?? authorError ?? courseSubjectError)}
					</pre>
				</div>
			</div>
		);
	}

	// Erfolgsfall
	return (
		<div className="bg-neutral-50 min-h-screen">
			<AnalyticsDashboard data={dashboardData} />
		</div>
	);
}
