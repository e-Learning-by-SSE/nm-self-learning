export function LearningDiaryEntryStatusBadge({
	hasRead,
	isDraft,
	children
}: {
	hasRead: boolean;
	isDraft: boolean;
	children: React.ReactNode;
}) {
	if (!isDraft) {
		return null;
	}

	return (
		<div className="relative w-full">
			<span
				className={`absolute left-[-17px] top-1 transform -translate-y-1/2 ${hasRead ? "bg-gray-200" : "bg-green-500"} rounded-full h-2 w-2`}
			></span>
			{children}
		</div>
	);
}
