import {
	CheckCircleIcon,
	ExclamationCircleIcon,
	EllipsisHorizontalCircleIcon
} from "@heroicons/react/24/solid";

export function LearningDiaryEntryStatusBadge({
	hasRead,
	isDraft,
	className
}: {
	hasRead: boolean;
	isDraft: boolean;
	className?: string;
}) {
	let icon;
	if (isDraft) {
		if (hasRead) {
			icon = <EllipsisHorizontalCircleIcon className="fill-gray-400" />;
		} else {
			icon = <ExclamationCircleIcon className="fill-blue-400" />;
		}
	} else {
		icon = <CheckCircleIcon className="fill-green-500" />;
	}

	return (
		<div className="relative w-full">
			<div className={`absolute -left-5 ${className} -translate-y-1/2 h-5 w-5`}>{icon}</div>
		</div>
	);
}
