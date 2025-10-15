import { motion } from "framer-motion";

/**
 * Restricts output to a valid percentage (0-100) with 2 digits (except for 100).
 * @param value Valid percentage value (0-100)
 * @returns 0.00 - 99.99 or 100
 */
function formatPercentage(value: number): string {
	// Ensure valid percentage (0 and 100)
	const clamped = Math.min(100, Math.max(0, value));

	// Keep 100 as-is
	if (clamped === 100) return "100";

	// If it's a decimal, limit to 2 digits
	return clamped.toFixed(2);
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
				{formatPercentage(completionPercentage)}%
			</div>
		</div>
	);
}
