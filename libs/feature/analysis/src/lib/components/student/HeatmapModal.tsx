"use client";

import { Dialog } from "@headlessui/react";
import { DropdownMenu } from "@self-learning/ui/common";
import { ChevronDownIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export function HeatmapModal({ onClose }: { onClose: () => void }) {
	const [selected, setSelected] = useState<string | null>(null);
	const options = ["Hours", "Units", "Accuracy"];

	return (
		<Dialog open={true} onClose={onClose} className="relative z-50">
			{/* Background overlay */}
			<div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

			{/* Centered modal */}
			<div className="fixed inset-0 flex items-center justify-center p-4">
				<Dialog.Panel className="w-full max-w-5xl rounded-2xl bg-white p-8 shadow-xl relative">
					{/* Header */}
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-xl font-semibold text-gray-800">Study Heatmaps</h2>
					</div>

					<div
						className="flex justify-end mb-6 relative z-40"
						onClick={e => e.stopPropagation()}
					>
						<DropdownMenu
							title="Select Heatmap Type"
							button={
								selected ? (
									<div className="flex items-center justify-between w-40 rounded-md bg-emerald-500 text-white font-semibold px-4 py-2">
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
									<div className="flex items-center justify-between w-40 border border-gray-300 rounded-md px-4 py-2 text-gray-700 font-medium bg-white">
										<span className="truncate">Choose...</span>
										<ChevronDownIcon className="h-4 w-4 ml-2 text-gray-500" />
									</div>
								)
							}
						>
							{options.map((option, i) => (
								<span
									key={option}
									onClick={() => setSelected(option)}
									className={`cursor-pointer block px-4 py-2 w-40 text-left transition-colors ${
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
						{["Day Heatmap", "Week Heatmap", "Month Heatmap", "Year Heatmap"].map(
							(label, idx) => (
								<div
									key={idx}
									className="rounded-lg border border-gray-200 bg-gray-50 h-56 flex items-center justify-center text-gray-400 hover:text-gray-600"
								>
									{label}
								</div>
							)
						)}
					</div>

					{/*  Footer Close Button */}
					<div className="mt-8 flex justify-end">
						<button
							type="button"
							onClick={onClose}
							className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
						>
							Close
						</button>
					</div>
				</Dialog.Panel>
			</div>
		</Dialog>
	);
}
