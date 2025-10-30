"use client";

import { useState } from "react";
import { HeatmapModal } from "./HeatmapModal";
import { DropdownMenu } from "@self-learning/ui/common";
import { ChevronDownIcon, XMarkIcon } from "@heroicons/react/24/outline";

export function GeneralHeatmap() {
	const [open, setOpen] = useState(false);
	const [selected, setSelected] = useState<string | null>(null);
	const options = ["Zeit", "Alle Aufgaben", "Richtige Aufgaben"];

	return (
		<>
			<div
				id="StudyHeatmapsCard"
				className="w-full max-w-3xl rounded-lg border border-light-border bg-white shadow-sm hover:shadow-md transition-shadow p-6"
			>
				<div className="flex items-center justify-between mb-4 relative">
					<h2 className="text-xl font-semibold text-gray-800">Lern-Heatmaps</h2>

					{/* Dropdown */}
					<div className="relative z-40" onClick={e => e.stopPropagation()}>
						<DropdownMenu
							title="Select Heatmap Type"
							button={
								selected ? (
									<div className="flex items-center justify-between w-44 rounded-md bg-emerald-500 text-white font-semibold px-4 py-2">
										<span className="truncate">{selected}</span>
										<XMarkIcon
											className="h-4 w-4 ml-2 cursor-pointer text-white hover:text-gray-200"
											onClick={e => {
												e.stopPropagation();
												setSelected(null);
											}}
										/>
									</div>
								) : (
									<div className="flex items-center justify-between w-44 border border-gray-300 rounded-md px-4 py-2 text-gray-700 font-medium bg-white">
										<span className="truncate">Wähle...</span>
										<ChevronDownIcon className="h-4 w-4 ml-2 text-gray-500" />
									</div>
								)
							}
						>
							{options.map((option, i) => (
								<span
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
				</div>

				{/* Clickable area for opening modal */}
				<div
					onClick={() => setOpen(true)}
					className="rounded-lg border border-gray-200 bg-gray-50 h-60 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-emerald-500 transition-colors cursor-pointer"
				>
					Hier klicken, um detaillierte Heatmaps zu öffnen
				</div>
			</div>

			{open && <HeatmapModal onClose={() => setOpen(false)} />}
		</>
	);
}
