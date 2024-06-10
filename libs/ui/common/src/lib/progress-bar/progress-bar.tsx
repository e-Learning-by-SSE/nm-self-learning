import { motion } from "framer-motion";
import React from "react";

/**
 * A reusable progress bar component, which uses the platform's color scheme (emerald).
 * @param progress A function which indicates the current progress in percent (0 = not started; 100 = finished)
 * @returns A React component to visualize the progress
 */
export function UploadProgressBar({ progress }: { progress: number }) {
	return (
		<div className="mb-4 h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
			<div
				className="h-2.5 rounded-full bg-emerald-500"
				style={{ width: `${progress}%` }}
			></div>
		</div>
	);
}

export function ProgressBar({ completionPercentage }: { completionPercentage: number }) {
	return (
		<div className="relative h-5 w-full rounded-lg bg-gray-200">
			<motion.div
				className="absolute left-0 h-5 rounded-lg bg-secondary"
				initial={{ width: 0 }}
				animate={{
					width: `${completionPercentage}%`
				}}
				transition={{ type: "tween" }}
			/>
			<div
				className={`absolute top-0 w-full px-2 text-start text-sm font-semibold ${
					completionPercentage === 0 ? "text-secondary" : "text-white"
				}`}
				style={{ justifyContent: "flex-start" }}
			>
				{completionPercentage}%
			</div>
		</div>
	);
}
