import {
	CheckCircleIcon,
	ExclamationCircleIcon,
	EllipsisHorizontalCircleIcon
} from "@heroicons/react/24/solid";
import { DetailsDropdown } from "@self-learning/ui/common";

function getIcon(hasRead: boolean, isDraft: boolean) {
	if (isDraft) {
		if (hasRead) {
			return <EllipsisHorizontalCircleIcon className="fill-c-info" />;
		} else {
			return <ExclamationCircleIcon className="fill-c-neutral" />;
		}
	} else {
		return <CheckCircleIcon className="fill-c-success" />;
	}
}

export function LearningDiaryEntryStatusBadge({
	hasRead,
	isDraft,
	className,
	size
}: {
	hasRead: boolean;
	isDraft: boolean;
	className?: string;
	size?: number;
}) {
	const icon = getIcon(hasRead, isDraft);
	const size_str = `h-${size ?? 5} w-${size ?? 5}`;

	return (
		<div className="relative w-full">
			<div className={`absolute -translate-y-1/2 -left-5 ${size_str} ${className ?? ""}`}>
				{icon}
			</div>
		</div>
	);
}

export function StatusBadgeInfo({
	header,
	headerStyles,
	className
}: {
	header: string;
	headerStyles?: string;
	className?: string;
}) {
	return (
		<DetailsDropdown header={header} headerStyles={headerStyles} className={className}>
			<div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 items-center text-sm p-3">
				<div className="flex items-center justify-center ml-4">
					<LearningDiaryEntryStatusBadge hasRead={false} isDraft={true} size={4} />
				</div>
				<div>
					<span className="font-medium">Neu:</span> Ein neuer Eintrag.
				</div>

				<div className="flex items-center justify-center ml-4">
					<LearningDiaryEntryStatusBadge hasRead={true} isDraft={true} size={4} />
				</div>
				<div>
					<span className="font-medium">Gelesen:</span> Einige Eingaben sind leer.
				</div>

				<div className="flex items-center justify-center ml-4">
					<LearningDiaryEntryStatusBadge hasRead={true} isDraft={false} size={4} />
				</div>
				<div>
					<span className="font-medium">Fertig:</span> Alle Eingaben sind ausgefüllt.
				</div>
			</div>
		</DetailsDropdown>
	);
}
