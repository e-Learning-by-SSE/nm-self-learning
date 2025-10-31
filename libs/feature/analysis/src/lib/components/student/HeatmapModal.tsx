"use client";

import { Dialog } from "@headlessui/react";
import { DropdownMenu } from "@self-learning/ui/common";
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useSession } from "next-auth/react";
import StudyTimeHeatmap from "../study-time-heatmap";
import { useTranslation } from "next-i18next";

/** ---------- Helpers ---------- */
function getWeekRange(date: Date, locale: string) {
	const day = date.getDay();
	const monday = new Date(date);
	monday.setDate(date.getDate() - ((day + 6) % 7));
	const sunday = new Date(monday);
	sunday.setDate(monday.getDate() + 6);

	const options: Intl.DateTimeFormatOptions = {
		day: "2-digit",
		month: "2-digit",
		year: "numeric"
	};

	return `${monday.toLocaleDateString(locale, options)} – ${sunday.toLocaleDateString(
		locale,
		options
	)}`;
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

function formatMonth(d: Date, locale: string) {
	return d.toLocaleDateString(locale, { month: "long", year: "numeric" });
}

/** ---------- Component ---------- */
export function HeatmapModal({ onClose }: { onClose: () => void }) {
	const { t, i18n } = useTranslation("student-analytics");
	const { data: session } = useSession();
	const name = session?.user?.name ?? t("defaultName");

	const metricOptions = ["timeMetric", "completedTasks", "correctTasks"];
	const [selectedMetric, setSelectedMetric] = useState<string>(metricOptions[0]);

	const [daySelection, setDaySelection] = useState(new Date());
	const [weekSelection, setWeekSelection] = useState(new Date());
	const [monthSelection, setMonthSelection] = useState(new Date());
	const [yearSelection, setYearSelection] = useState(new Date());

	const legendItems = [
		{ color: "#D9D9D9", label: t("noActivity") },
		{ color: "#9EF7D9", label: t("veryLow") },
		{ color: "#14E8A2", label: t("low") },
		{ color: "#10B981", label: t("medium") },
		{ color: "#0C8A60", label: t("high") },
		{ color: "#085B40", label: t("veryHigh") }
	];

	return (
		<Dialog open={true} onClose={onClose} className="relative z-50">
			{/* Background overlay */}
			<div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

			{/* Centered modal panel */}
			<div id="HeatmapModal" className="fixed inset-0 flex items-center justify-center p-4">
				<Dialog.Panel
					id="HeatmapModalPanel"
					className="w-full max-w-6xl rounded-2xl bg-white p-4 sm:p-8 shadow-xl relative overflow-y-auto max-h-[90vh]"
				>
					{/* Header */}
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-xl font-semibold text-gray-800">
							{t("heatmapModal.title")}
						</h2>
						<button
							onClick={onClose}
							className="rounded-md p-2 hover:bg-gray-100 text-gray-600"
							aria-label={t("close")}
						>
							<XMarkIcon className="h-5 w-5" />
						</button>
					</div>

					{/* Info Text */}
					<div className="text-gray-700 text-sm mb-6">
						<p
							dangerouslySetInnerHTML={{
								__html: t("heatmapModal.intro.hey", { name })
							}}
						/>

						<p
							className="mt-2"
							dangerouslySetInnerHTML={{
								__html: t("heatmapModal.intro.description")
							}}
						/>

						<p className="mt-2">
							<span
								dangerouslySetInnerHTML={{
									__html: t("heatmapModal.intro.metricTime")
								}}
							/>
							<br />
							<span
								dangerouslySetInnerHTML={{
									__html: t("heatmapModal.intro.metricCompleted")
								}}
							/>
							<br />
							<span
								dangerouslySetInnerHTML={{
									__html: t("heatmapModal.intro.metricCorrect")
								}}
							/>
						</p>

						<p
							className="mt-2 mb-4"
							dangerouslySetInnerHTML={{ __html: t("heatmapModal.intro.proTip") }}
						/>

						{/* ---------- Color legend  ---------- */}
						<div className="flex flex-wrap gap-2 items-center mt-4">
							<span className="text-sm font-semibold text-gray-700 mr-2">
								{t("heatmapModal.legendTitle")}
							</span>
							{legendItems.map(item => (
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
							title={t("heatmapModal.selectMetricTitle")}
							button={
								<div className="flex items-center justify-between w-44 rounded-md bg-emerald-500 text-white font-semibold px-4 py-2">
									<span id="HeatmapTypeButton" className="truncate">
										{t(selectedMetric)}
									</span>
									<XMarkIcon
										id="HeatmapTypeButtonClose"
										className="h-4 w-4 ml-2 cursor-pointer text-white hover:text-gray-200"
										onClick={e => {
											e.stopPropagation();
											setSelectedMetric(metricOptions[0]);
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
									{t(option)}
								</span>
							))}
						</DropdownMenu>
					</div>

					{/* Heatmaps Grid */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full overflow-x-auto">
						{/* --- Day --- */}
						<div
							id="DayHeatmap"
							className="rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm min-w-[320px]"
						>
							<div className="flex flex-wrap items-center justify-between mb-3 gap-2">
								<div className="flex items-center gap-2">
									<h3 className="text-lg font-semibold text-gray-700">
										{t("heatmapModal.dayView.title")}
									</h3>
									<button
										title={t("heatmapModal.dayView.tooltip")}
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
								metric={selectedMetric}
								selection={daySelection}
								heightPx={220}
							/>
						</div>

						{/* --- Week --- */}
						<div
							id="WeekHeatmap"
							className="rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm min-w-[320px]"
						>
							<div className="flex flex-wrap items-center justify-between mb-3 gap-2">
								<div className="flex items-center gap-2">
									<h3 className="text-lg font-semibold text-gray-700">
										{t("heatmapModal.weekView.title")}
									</h3>
									<button
										title={t("heatmapModal.weekView.tooltip")}
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
										title={t("heatmapModal.weekView.prev")}
									>
										<ChevronLeftIcon className="h-5 w-5 text-gray-600" />
									</button>
									<span className="text-xs sm:text-sm text-gray-700 font-medium min-w-[140px] text-center">
										{getWeekRange(weekSelection, i18n.language)}
									</span>
									<button
										onClick={() => setWeekSelection(addWeeks(weekSelection, 1))}
										className="p-1 rounded-md hover:bg-gray-200"
										title={t("heatmapModal.weekView.next")}
									>
										<ChevronRightIcon className="h-5 w-5 text-gray-600" />
									</button>
								</div>
							</div>
							<div className="overflow-x-auto">
								<StudyTimeHeatmap
									period="week"
									metric={selectedMetric}
									selection={weekSelection}
									heightPx={220}
								/>
							</div>
						</div>

						{/* --- Month --- */}
						<div
							id="MonthHeatmap"
							className="rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm min-w-[320px]"
						>
							<div className="flex flex-wrap items-center justify-between mb-3 gap-2">
								<div className="flex items-center gap-2">
									<h3 className="text-lg font-semibold text-gray-700">
										{t("heatmapModal.monthView.title")}
									</h3>
									<button
										title={t("heatmapModal.monthView.tooltip")}
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
										title={t("heatmapModal.monthView.prev")}
									>
										<ChevronLeftIcon className="h-5 w-5 text-gray-600" />
									</button>
									<span className="text-xs sm:text-sm text-gray-700 font-medium min-w-[120px] text-center">
										{formatMonth(monthSelection, i18n.language)}
									</span>
									<button
										onClick={() =>
											setMonthSelection(addMonths(monthSelection, 1))
										}
										className="p-1 rounded-md hover:bg-gray-200"
										title={t("heatmapModal.monthView.next")}
									>
										<ChevronRightIcon className="h-5 w-5 text-gray-600" />
									</button>
								</div>
							</div>
							<div className="overflow-x-auto">
								<StudyTimeHeatmap
									period="month"
									metric={selectedMetric}
									selection={monthSelection}
									heightPx={250}
								/>
							</div>
						</div>

						{/* --- Year --- */}
						<div
							id="YearHeatmap"
							className="rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm min-w-[320px]"
						>
							<div className="flex flex-wrap items-center justify-between mb-3 gap-2">
								<div className="flex items-center gap-2">
									<h3 className="text-lg font-semibold text-gray-700">
										{t("heatmapModal.yearView.title")}
									</h3>
									<button
										title={t("heatmapModal.yearView.tooltip")}
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
										title={t("heatmapModal.yearView.prev")}
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
										title={t("heatmapModal.yearView.next")}
									>
										<ChevronRightIcon className="h-5 w-5 text-gray-600" />
									</button>
								</div>
							</div>
							<StudyTimeHeatmap
								period="year"
								metric={selectedMetric}
								selection={yearSelection}
								heightPx={250}
							/>
						</div>
					</div>
				</Dialog.Panel>
			</div>
		</Dialog>
	);
}
