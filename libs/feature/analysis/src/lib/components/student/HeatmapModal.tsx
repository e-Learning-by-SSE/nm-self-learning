"use client";

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { DropdownMenu, IconButton } from "@self-learning/ui/common";
import { ChevronDownIcon, XMarkIcon } from "@heroicons/react/24/outline";

export function HeatmapModal({ onClose }: { onClose: () => void }) {
	const [selected, setSelected] = useState<string | null>("Units");
	const options = ["Hours", "Units", "Accuracy"];

	return (
		<Dialog open={true} onClose={onClose} className="relative z-50">
			{/* Background overlay */}
			<div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

			{/* Centered modal */}
			<div className="fixed inset-0 flex items-center justify-center p-4">
				<Dialog.Panel className="w-full max-w-5xl rounded-2xl bg-white p-8 shadow-xl relative">
					{/* Header */}
					<div className="flex justify-between items-center mb-6">
						<Dialog.Title className="text-xl font-semibold text-gray-800">
							Study Heatmaps
						</Dialog.Title>

						{/* Dropdown positioned top-right */}
						<div className="absolute top-8 right-8">
							<DropdownMenu
								title="Select Heatmap Type"
								button={
									selected ? (
										<div className="flex items-center justify-between w-40 rounded-md bg-emerald-500 text-white font-semibold px-4 py-2">
											<span className="truncate">{selected}</span>
											<XMarkIcon
												className="h-4 w-4 ml-2 cursor-pointer text-white hover:text-gray-200"
												onClick={() => setSelected(null)}
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
					</div>

					{/* Grid of heatmaps */}
					<div className="mt-10 grid grid-cols-2 gap-6">
						{["Day heatmap", "Week heatmap", "Month heatmap", "Year heatmap"].map(
							(label, idx) => (
								<div
									key={idx}
									className="rounded-lg border border-gray-200 bg-gray-50 h-56 flex items-center justify-center text-gray-400"
								>
									{label}
								</div>
							)
						)}
					</div>

					{/* Footer */}
					<div className="mt-8 flex justify-end">
						<IconButton
							icon={<></>}
							text="Close"
							variant="tertiary"
							onClick={onClose}
						/>
					</div>
				</Dialog.Panel>
			</div>
		</Dialog>
	);
}
