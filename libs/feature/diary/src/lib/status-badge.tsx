export function LearningDiaryEntryStatusBadge({
	hasRead,
	isDraft,
	className
}: {
	hasRead: boolean;
	isDraft: boolean;
	className?: string;
}) {
	let colorClass = "";
	if (isDraft) {
		if (hasRead) {
			colorClass = "bg-gray-400";
		} else {
			colorClass = "bg-blue-400";
		}
	} else {
		colorClass = "bg-green-500";
	}

	return (
		<div className="relative w-full">
			<span
				className={`absolute left-[-17px] top-1 ${className} transform -translate-y-1/2 ${colorClass} rounded-full h-2 w-2`}
			></span>
		</div>
	);
}
