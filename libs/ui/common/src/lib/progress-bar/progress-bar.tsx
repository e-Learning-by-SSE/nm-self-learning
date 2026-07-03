import { motion } from "framer-motion";

export function ProgressBar({
	progressPercentage,
	bgColor = "bg-c-primary",
	text
}: {
	progressPercentage: number;
	bgColor?: string;
	text?: string;
}) {
	return (
		<div className="relative h-5 w-full rounded-lg bg-c-surface-3">
			<motion.div
				className={`absolute left-0 h-5 rounded-lg ${bgColor}`}
				initial={{ width: 0 }}
				animate={{
					width: `${progressPercentage}%`
				}}
				transition={{ type: "tween" }}
			/>
			<div
				className={`absolute top-0 w-full px-2 text-start text-sm font-semibold ${
					progressPercentage === 0 ? "text-c-primary" : "text-white"
				}`}
				style={{ justifyContent: "flex-start" }}
			>
				{progressPercentage > 0 && text ? <span>{`${text}`}</span> : null}
			</div>
		</div>
	);
}

export function ProgressBarAnimated({ progressPercentage }: { progressPercentage: number }) {
	return (
		<div className="mt-3">
			<div className="relative h-5 w-full rounded-lg bg-c-surface-3 overflow-hidden">
				<motion.div
					className="absolute left-0 h-5 rounded-lg bg-gradient-to-r from-c-primary-muted to-c-primary-strong"
					initial={{ width: 0 }}
					animate={{
						width: `${progressPercentage}%`
					}}
					transition={{
						type: "spring",
						stiffness: 100,
						damping: 20,
						duration: 1.2
					}}
				/>

				{/* Shimmer-Effekt */}
				<motion.div
					className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
					initial={{ x: "-100%" }}
					animate={{ x: "100%" }}
					transition={{
						repeat: Infinity,
						duration: 1.5,
						ease: "linear"
					}}
					style={{ width: `${progressPercentage}%` }}
				/>

				<div
					className={`absolute top-0 w-full px-2 text-start text-sm font-semibold flex items-center h-full ${
						progressPercentage === 0 ? "text-c-primary-strong" : "text-white"
					}`}
				>
					{Math.round(progressPercentage)}%
				</div>
			</div>

			<div className="flex justify-between items-center mt-1">
				<p className="text-xs text-c-text-muted">{progressPercentage}/100</p>
				{progressPercentage >= 100 && (
					<span className="text-xs text-c-primary-strong font-semibold animate-pulse">
						Abgeschlossen!
					</span>
				)}
			</div>
		</div>
	);
}
