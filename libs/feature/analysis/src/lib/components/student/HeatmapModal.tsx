"use client";

import { Dialog } from "@headlessui/react";
import { DropdownMenu } from "@self-learning/ui/common";
import { ChevronDownIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

type HeatmapModalProps = {
	selectedMetric: string; // <-- added prop
	onClose: () => void;
};

export function HeatmapModal({ selectedMetric, onClose }: HeatmapModalProps) {
	const [selected, setSelected] = useState<string | null>(null);
	const options = ["Stunden", "Einheiten", "Genauigkeit"];

	// When modal opens, sync selected metric from parent
	useEffect(() => {
		if (selectedMetric === "Zeit") setSelected("Stunden");
		else if (selectedMetric === "Abgeschlossene Aufgaben") setSelected("Einheiten");
		else if (selectedMetric === "Richtige Aufgaben") setSelected("Genauigkeit");
	}, [selectedMetric]);

	return (
		<Dialog open={true} onClose={onClose} className="relative z-50">
			{/* Background overlay */}
			<div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

			{/* Centered modal panel */}
			<div id="HeatmapModal" className="fixed inset-0 flex items-center justify-center p-4">
				<Dialog.Panel className="w-full max-w-5xl rounded-2xl bg-white p-8 shadow-xl relative">
					{/* Header */}
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-xl font-semibold text-gray-800">
							Studien-Heatmaps – {selected || "Auswählen..."}
						</h2>
						{/* Added XMarkIcon button as per UI-UX guidelines */}
						<button
							onClick={onClose}
							className="rounded-md p-2 text-gray-600 hover:bg-gray-100"
							aria-label="Schließen"
						>
							<XMarkIcon className="h-6 w-6" />
						</button>
					</div>

					{/* Dropdown for selecting heatmap type */}
					<div
						className="flex justify-end mb-6 relative z-40"
						onClick={e => e.stopPropagation()}
					>
						<DropdownMenu
							key={selected}
							title="Heatmap-Typ auswählen"
							button={
								<div
									className={`flex items-center justify-between w-44 rounded-md px-4 py-2 font-semibold transition-colors ${
										selected
											? "bg-emerald-500 text-white"
											: "border border-gray-300 bg-white text-gray-700"
									}`}
								>
									<span id="HeatmapTypeButton" className="truncate">
										{selected || "Auswählen..."}
									</span>
									{selected ? (
										<XMarkIcon
											id="HeatmapTypeButtonClose"
											className="h-4 w-4 ml-2 cursor-pointer text-white hover:text-gray-200"
											onClick={e => {
												e.stopPropagation();
												setSelected(null);
											}}
										/>
									) : (
										<ChevronDownIcon className="h-4 w-4 ml-2 text-gray-500" />
									)}
								</div>
							}
						>
							{options.map((option, i) => (
								<span
									id="HeatmapTypeOption"
									key={option}
									onClick={() => setSelected(option)}
									className={`cursor-pointer block px-4 py-2 w-44 text-left transition-colors ${
										selected === option
											? "bg-emerald-500 text-white"
											: "hover:bg-emerald-500 hover:text-white"
									} ${
										i === 0
											? "rounded-t-md"
											: i === options.length - 1
												? "rounded-b-md"
												: ""
									}`}
								>
									{option}
								</span>
							))}
						</DropdownMenu>
					</div>

					{/* Heatmap Grid */}
					<div className="grid grid-cols-2 gap-6">
						{[
							"Tages-Heatmap",
							"Wochen-Heatmap",
							"Monats-Heatmap",
							"Jahres-Heatmap"
						].map((label, idx) => (
							<div
								key={idx}
								className="rounded-lg border border-gray-200 bg-gray-50 h-56 flex items-center justify-center text-gray-400 hover:text-gray-600"
							>
								{label} – {selected || "Keine Auswahl"}
							</div>
						))}
					</div>

					{/* Footer Close Button - REMOVED per UI-UX guidelines */}
					{/* <div className="mt-8 flex justify-end">
                        <button
                            id="HeatmapModalCloseButton"
                            type="button"
                            onClick={onClose}
                            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
                        >
                            Schließen
                        </button>
                    </div>
                    */}
				</Dialog.Panel>
			</div>
		</Dialog>
	);
}
