"use client";

import { Dialog } from "@headlessui/react";
import { DropdownMenu } from "@self-learning/ui/common";
import {
	ChevronDownIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	XMarkIcon
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { useSession } from "next-auth/react";
import StudyTimeHeatmap from "../study-time-heatmap";

/** ---------- Helpers ---------- */
function getWeekRange(date: Date) {
	const day = date.getDay();
	const monday = new Date(date);
	monday.setDate(date.getDate() - ((day + 6) % 7));
	const sunday = new Date(monday);
	sunday.setDate(monday.getDate() + 6);

	const format = (d: Date) =>
		`${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(
			2,
			"0"
		)}.${d.getFullYear()}`;

	return `${format(monday)} – ${format(sunday)}`;
}

function addWeeks(date: Date, n: number) {
	const d = new Date(date);
	d.setDate(d.getDate() + n * 7);
	return d;
}

function addMonths(date: Date, n: number) {
	const d = new Date(date);
	d.setMonth(d.getMonth() + n);
	return d;
}

function formatMonth(d: Date) {
	return d.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
}

/** ---------- Component ---------- */
export function HeatmapModal({ onClose }: { onClose: () => void }) {
	const { data: session } = useSession();
	const name = session?.user?.name ?? "Lernender";

	/** ---  Default selection = "Zeit" --- */
	const [selectedMetric, setSelectedMetric] = useState<string>("Zeit");
	const metricOptions = ["Zeit", "Alle Aufgaben", "Richtige Aufgaben"];

	const [daySelection, setDaySelection] = useState(new Date());
	const [weekSelection, setWeekSelection] = useState(new Date());
	const [monthSelection, setMonthSelection] = useState(new Date());
	const [yearSelection, setYearSelection] = useState(new Date());

	return (
		<Dialog open={true} onClose={onClose} className="relative z-50">
			{/* Background overlay */}
			<div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

			{/* Centered modal panel */}
			<div id="HeatmapModal" className="fixed inset-0 flex items-center justify-center p-4">
				<Dialog.Panel className="w-full max-w-6xl rounded-2xl bg-white p-4 sm:p-8 shadow-xl relative overflow-y-auto max-h-[90vh]">
					{/* Header */}
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-xl font-semibold text-gray-800">Lern-Heatmaps</h2>
						<button
							onClick={onClose}
							className="rounded-md p-2 hover:bg-gray-100 text-gray-600"
						>
							<XMarkIcon className="h-5 w-5" />
						</button>
					</div>

					{/* Info Text */}
					<div className="text-gray-700 text-sm mb-6">
						<p>
							<strong>Hey {name}!</strong> Behalte deinen Lernfortschritt mit deinen
							persönlichen <strong>Lern-HeatMaps</strong> im Blick. 🔥
						</p>

						<p className="mt-2">
							Sie zeigen dir, <strong>wann und wie intensiv du gelernt hast</strong> –
							ob pro <strong>Tag</strong>, <strong>Woche</strong>,{" "}
							<strong>Monat</strong> oder im <strong>ganzen Jahr</strong>.
						</p>

						<p className="mt-2">
							⏱️ <strong>Zeit:</strong> Wie viele Minuten oder Stunden du aktiv
							gelernt hast.
							<br />✅ <strong>Erledigte Aufgaben:</strong> Wie viele Aufgaben du
							abgeschlossen hast.
							<br />
							🎯 <strong>Richtige Aufgaben:</strong> Wie oft du die richtige Lösung
							gefunden hast.
						</p>

						<p className="mt-2 mb-4">
							💡 <strong>Pro-Tipp:</strong> Fahre mit der Maus über ein Feld, um zu
							sehen, <strong>wie viel du an diesem Tag geschafft hast.</strong>
						</p>

						{/* ---------- Color legend  ---------- */}
						<div className="flex flex-wrap gap-2 items-center mt-4">
							<span className="text-sm font-semibold text-gray-700 mr-2">
								Aktivitäts-Legende:
							</span>
							{[
								{ color: "#D9D9D9", label: "Keine Aktivität" },
								{ color: "#9EF7D9", label: "Sehr gering" },
								{ color: "#14E8A2", label: "Gering" },
								{ color: "#10B981", label: "Mittel" },
								{ color: "#0C8A60", label: "Hoch" },
								{ color: "#085B40", label: "Sehr hoch" }
							].map(item => (
								<div key={item.label} className="flex items-center gap-1">
									<span
										className="inline-block w-4 h-4 rounded-full border border-gray-300"
										style={{ backgroundColor: item.color }}
									></span>
									<span className="text-sm text-gray-700">{item.label}</span>
								</div>
							))}
						</div>
					</div>

					{/* Metric Dropdown */}
					<div
						className="flex justify-end mb-8 relative z-40"
						onClick={e => e.stopPropagation()}
					>
						<DropdownMenu
							title="Metrik wählen"
							button={
								<div className="flex items-center justify-between w-44 rounded-md bg-emerald-500 text-white font-semibold px-4 py-2">
									<span id="HeatmapTypeButton" className="truncate">
										{selectedMetric}
									</span>
									<XMarkIcon
										id="HeatmapTypeButtonClose"
										className="h-4 w-4 ml-2 cursor-pointer text-white hover:text-gray-200"
										onClick={e => {
											e.stopPropagation();
											setSelectedMetric("Zeit");
										}}
									/>
								</div>
							}
						>
							{metricOptions.map((option, i) => (
								<span
									id="HeatmapTypeOption"
									key={option}
									onClick={() => setSelectedMetric(option)}
									className={`cursor-pointer block px-4 py-2 w-44 text-left transition-colors ${
										selectedMetric === option
											? "bg-emerald-500 text-white"
											: "hover:bg-emerald-500 hover:text-white"
									} ${
										i === 0
											? "rounded-t-md"
											: i === metricOptions.length - 1
												? "rounded-b-md"
												: ""
									}`}
								>
									{option}
								</span>
							))}
						</DropdownMenu>
					</div>

					{/* Heatmaps Grid */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full overflow-x-auto">
						{/* --- Day --- */}
						<div className="rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm min-w-[320px]">
							<div className="flex flex-wrap items-center justify-between mb-3 gap-2">
								<div className="flex items-center gap-2">
									<h3 className="text-lg font-semibold text-gray-700">
										Tagesansicht
									</h3>
									<button
										title="Zeigt deine Lernaktivität pro Stunde des ausgewählten Tages."
										className="text-gray-400 hover:text-gray-600 transition-colors"
									>
										ⓘ
									</button>
								</div>
								<input
									type="date"
									className="border border-gray-300 rounded-md px-2 py-1 text-sm text-gray-700 focus:ring-2 focus:ring-emerald-400"
									value={daySelection.toISOString().split("T")[0]}
									onChange={e => setDaySelection(new Date(e.target.value))}
								/>
							</div>
							<StudyTimeHeatmap
								period="day"
								metric={(selectedMetric?.toLowerCase() as any) || "hours"}
								selection={daySelection}
								heightPx={220}
							/>
						</div>

						{/* --- Week --- */}
						<div className="rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm min-w-[320px]">
							<div className="flex flex-wrap items-center justify-between mb-3 gap-2">
								<div className="flex items-center gap-2">
									<h3 className="text-lg font-semibold text-gray-700">
										Wochenansicht
									</h3>
									<button
										title="Zeigt, wie aktiv du an jedem Wochentag in verschiedenen Tageszeiten warst."
										className="text-gray-400 hover:text-gray-600 transition-colors"
									>
										ⓘ
									</button>
								</div>
								<div className="flex items-center flex-wrap gap-2">
									<button
										onClick={() =>
											setWeekSelection(addWeeks(weekSelection, -1))
										}
										className="p-1 rounded-md hover:bg-gray-200"
										title="Vorherige Woche"
									>
										<ChevronLeftIcon className="h-5 w-5 text-gray-600" />
									</button>
									<span className="text-xs sm:text-sm text-gray-700 font-medium min-w-[140px] text-center">
										{getWeekRange(weekSelection)}
									</span>
									<button
										onClick={() => setWeekSelection(addWeeks(weekSelection, 1))}
										className="p-1 rounded-md hover:bg-gray-200"
										title="Nächste Woche"
									>
										<ChevronRightIcon className="h-5 w-5 text-gray-600" />
									</button>
								</div>
							</div>
							<div className="overflow-x-auto">
								<StudyTimeHeatmap
									period="week"
									metric={(selectedMetric?.toLowerCase() as any) || "hours"}
									selection={weekSelection}
									heightPx={220}
								/>
							</div>
						</div>

						{/* --- Month --- */}
						<div className="rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm min-w-[320px]">
							<div className="flex flex-wrap items-center justify-between mb-3 gap-2">
								<div className="flex items-center gap-2">
									<h3 className="text-lg font-semibold text-gray-700">
										Monatsansicht
									</h3>
									<button
										title="Zeigt deine Aktivität pro Tag im gewählten Monat."
										className="text-gray-400 hover:text-gray-600 transition-colors"
									>
										ⓘ
									</button>
								</div>
								<div className="flex items-center flex-wrap gap-2">
									<button
										onClick={() =>
											setMonthSelection(addMonths(monthSelection, -1))
										}
										className="p-1 rounded-md hover:bg-gray-200"
										title="Vorheriger Monat"
									>
										<ChevronLeftIcon className="h-5 w-5 text-gray-600" />
									</button>
									<span className="text-xs sm:text-sm text-gray-700 font-medium min-w-[120px] text-center">
										{formatMonth(monthSelection)}
									</span>
									<button
										onClick={() =>
											setMonthSelection(addMonths(monthSelection, 1))
										}
										className="p-1 rounded-md hover:bg-gray-200"
										title="Nächster Monat"
									>
										<ChevronRightIcon className="h-5 w-5 text-gray-600" />
									</button>
								</div>
							</div>
							<div className="overflow-x-auto">
								<StudyTimeHeatmap
									period="month"
									metric={(selectedMetric?.toLowerCase() as any) || "hours"}
									selection={monthSelection}
									heightPx={250}
								/>
							</div>
						</div>

						{/* --- Year --- */}
						<div className="rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm min-w-[320px]">
							<div className="flex flex-wrap items-center justify-between mb-3 gap-2">
								<div className="flex items-center gap-2">
									<h3 className="text-lg font-semibold text-gray-700">
										Jahresansicht
									</h3>
									<button
										title="Zeigt deine gesamte Lernaktivität pro Monat im Jahr."
										className="text-gray-400 hover:text-gray-600 transition-colors"
									>
										ⓘ
									</button>
								</div>
								<div className="flex items-center flex-wrap gap-2">
									<button
										onClick={() =>
											setYearSelection(
												new Date(
													yearSelection.getFullYear() - 1,
													yearSelection.getMonth(),
													1
												)
											)
										}
										className="p-1 rounded-md hover:bg-gray-200"
										title="Vorheriges Jahr"
									>
										<ChevronLeftIcon className="h-5 w-5 text-gray-600" />
									</button>
									<span className="text-xs sm:text-sm text-gray-700 font-medium text-center min-w-[60px]">
										{yearSelection.getFullYear()}
									</span>
									<button
										onClick={() =>
											setYearSelection(
												new Date(
													yearSelection.getFullYear() + 1,
													yearSelection.getMonth(),
													1
												)
											)
										}
										className="p-1 rounded-md hover:bg-gray-200"
										title="Nächstes Jahr"
									>
										<ChevronRightIcon className="h-5 w-5 text-gray-600" />
									</button>
								</div>
							</div>
							<StudyTimeHeatmap
								period="year"
								metric={(selectedMetric?.toLowerCase() as any) || "hours"}
								selection={yearSelection}
								heightPx={250}
							/>
						</div>
					</div>

					{/*  Footer Close Button 
					<div className="mt-8 flex justify-end">
						<button
							id="HeatmapModalCloseButton"
							type="button"
							onClick={onClose}
							className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
						>
							Close
						</button>
					</div>
					*/}
				</Dialog.Panel>
			</div>
		</Dialog>
	);
}
