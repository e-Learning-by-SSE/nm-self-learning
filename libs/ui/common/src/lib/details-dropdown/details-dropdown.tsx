import { InformationCircleIcon as InformationCircleIconOutline } from "@heroicons/react/24/outline";
import { InformationCircleIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { IconOnlyButton } from "../button/button";

export function DetailsDropdown({
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
				<h2 className={`${headerStyles ?? "text-xl"} flex items-center`}>{header}</h2>
				<IconOnlyButton
					icon={
						<>
							{!isExpanded ? (
								<InformationCircleIconOutline className="h-6 w-6 text-c-text-muted transition-colors duration-200" />
							) : (
								<InformationCircleIcon className="h-6 w-6 text-c-primary transition-colors duration-200" />
							)}
						</>
					}
					className=""
					onClick={toggleExpanded}
					aria-expanded={isExpanded}
				/>
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
