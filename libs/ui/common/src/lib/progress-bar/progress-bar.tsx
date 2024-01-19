export function ProgressBar({
	progress,
	hideOnComplete = true
}: {
	progress: number;
	hideOnComplete?: boolean;
}) {
	if (progress < 100 || !hideOnComplete) {
		return (
			<div className="mb-4 h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
				<div
					className="h-2.5 rounded-full bg-emerald-500"
					style={{ width: `${progress}%` }}
				></div>
			</div>
		);
	} else {
		return null;
	}
}
