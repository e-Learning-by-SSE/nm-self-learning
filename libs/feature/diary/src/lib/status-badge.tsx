import {
	CheckCircleIcon,
	ExclamationCircleIcon,
	EllipsisHorizontalCircleIcon,
	InformationCircleIcon
} from "@heroicons/react/24/solid";
import { InformationCircleIcon as InformationCircleIconOutline } from "@heroicons/react/24/outline";
import { useState } from "react";

function getIcon(hasRead: boolean, isDraft: boolean) {
	if (isDraft) {
		if (hasRead) {
			return <EllipsisHorizontalCircleIcon className="fill-gray-400" />;
		} else {
			return <ExclamationCircleIcon className="fill-blue-400" />;
		}
	} else {
		return <CheckCircleIcon className="fill-green-500" />;
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

export function ExpandableDetailsSection({
	header,
	headerStyles,
	className,
	children
}: {
	header: string;
	headerStyles?: string;
	className?: string;
	children?: React.ReactNode;
}) {
	const [isExpanded, setIsExpanded] = useState(false);

	const toggleExpanded = () => {
		setIsExpanded(!isExpanded);
	};

	return (
		<section className={`${className}`}>
			<div className="flex justify-between">
				<h2 className={`${headerStyles ?? "text-xl"}`}>{header}</h2>
				<button
					className="rounded-full p-1 hover:bg-gray-100"
					onClick={toggleExpanded}
					aria-expanded={isExpanded}
				>
					{!isExpanded ? (
						<InformationCircleIconOutline className="h-6 w-6 text-gray-500 transition-colors duration-200" />
					) : (
						<InformationCircleIcon className="h-6 w-6 text-emerald-500 transition-colors duration-200" />
					)}
				</button>
			</div>
			<div
				className={`overflow-hidden transition-all duration-300 ${
					isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
				}`}
			>
				{children}
			</div>
		</section>
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
		<ExpandableDetailsSection header={header} headerStyles={headerStyles} className={className}>
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
		</ExpandableDetailsSection>
	);
}
