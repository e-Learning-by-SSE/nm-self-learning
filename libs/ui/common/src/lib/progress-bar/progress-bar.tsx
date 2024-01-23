/**
 * A reusable progress bar component, which uses the platform's color scheme (emerald).
 * @param progress A function which indicates the current progress in percent (0 = not started; 100 = finished)
 * @param hideOnComplete If true, the progress bar will be hidden after the progress has finished
 * @returns A React component to visualize the progress
 */
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
