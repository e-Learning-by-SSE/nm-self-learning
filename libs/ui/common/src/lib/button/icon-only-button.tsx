import { PencilIcon, PlusIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { ReactNode } from "react";
import { GreyBoarderButton } from "./button";

type Size = "small" | "medium" | "large";
/**
 * A method to get the size class for the icon.
 */
export function getButtonSizeClass(size: Size): string {
	let iconClass;
	switch (size) {
		case "small":
			iconClass = "h-3 w-3";
			break;
		case "medium":
			iconClass = "h-5 w-5";
			break;
		case "large":
			iconClass = "h-7 w-7";
			break;
		default:
			iconClass = "h-5 w-5";
			break;
	}

	return iconClass;
}

export function PlusButton({
	onClick,
	title,
	additionalClassNames,
	size = "medium"
}: {
	onClick: () => void;
	title: string;
	additionalClassNames?: string;
	size?: Size;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			title={title}
			className={`btn-small-highlight ${additionalClassNames}`}
		>
			<PlusIcon className={getButtonSizeClass(size)} />
		</button>
	);
}

export function TrashcanButton({
	onClick,
	title,
	label,
	additionalClassNames
}: {
	onClick: () => void;
	title?: string;
	label?: ReactNode;
	additionalClassNames?: string;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			title={title ? title : "Entfernen"}
			className={`rounded-md border border-transparent bg-red-500 px-4 py-2 hover:bg-red-600 ${additionalClassNames}`}
		>
			{label ? label : <TrashIcon className="h-5 w-5" />}
		</button>
	);
}

export function XButton({
	onClick,
	title,
	className = "",
	size = "medium"
}: {
	onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
	className?: string;
	title?: string;
	size?: "small" | "medium" | "large";
}) {
	return (
		<button
			type="button"
			data-testid="remove"
			title={title}
			className={`rounded-full text-gray-400 hover:bg-gray-50 hover:text-red-500 ${className}`}
			onClick={onClick}
		>
			<XMarkIcon className={getButtonSizeClass(size)} />
		</button>
	);
}

export function PencilButton({
	onClick,
	title,
	buttonTitle
}: {
	onClick: () => void;
	title: string;
	buttonTitle?: string;
}) {
	return (
		<GreyBoarderButton onClick={onClick} title={title} type="button">
			{buttonTitle && buttonTitle !== "" ? (
				<div className="flex items-center space-x-2">
					<PencilIcon className="h-5 w-5 text-gray-500" />
					<span className="text-gray-600">{buttonTitle}</span>
				</div>
			) : (
				<PencilIcon className="h-5 w-5 text-gray-500" />
			)}
		</GreyBoarderButton>
	);
}
