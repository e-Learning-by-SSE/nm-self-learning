import { motion } from "framer-motion";
import React from "react";

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
