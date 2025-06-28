import { ButtonHTMLAttributes, DetailedHTMLProps } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";

/**
 * Enhanced Icon Button with responsive text
 * Text disappears on small viewports, only icon remains visible
 *
 * @example
 * <IconButton text="Edit" icon={<PencilIcon className="h-5" />} variant="primary" />
 * <IconButton text="Delete" icon={<TrashIcon className="h-5" />} variant="danger" />
 */
export function IconButton({
	icon,
	text,
	variant = "primary",
	hideTextOnMobile = true,
	className = "",
	...props
}: DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
	icon: React.ReactNode;
	text: string;
	variant?: "primary" | "secondary" | "danger" | "tertiary";
	hideTextOnMobile?: boolean;
}) {
	const baseClasses = "btn btn-with-icon";
	const variantClass = `btn-${variant}`;
	const textClasses = hideTextOnMobile ? "hidden sm:inline" : "";

	return (
		<button type="button" className={`${baseClasses} ${variantClass} ${className}`} {...props}>
			{icon}
			<span className={`text-sm ${textClasses}`}>{text}</span>
		</button>
	);
}

/**
 * Icon-only button (no text, no border)
 * For cases where only the icon should be displayed
 */
export function IconOnlyButton({
	icon,
	variant = "tertiary",
	className = "",
	...props
}: DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
	icon: React.ReactNode;
	variant?: "primary" | "secondary" | "danger" | "tertiary";
}) {
	const baseClasses = "btn btn-icon-only";
	const variantClass = `btn-${variant}`;

	return (
		<button type="button" className={`${baseClasses} ${variantClass} ${className}`} {...props}>
			{icon}
		</button>
	);
}

// Size utility for icons
type Size = "small" | "medium" | "large";

export function getButtonSizeClass(size: Size): string {
	switch (size) {
		case "small":
			return "h-3 w-3";
		case "medium":
			return "h-5 w-5";
		case "large":
			return "h-7 w-7";
		default:
			return "h-5 w-5";
	}
}

// Specialized buttons that use the new unified system

export function XButton({
	onClick,
	title,
	className = "",
	size = "medium"
}: {
	onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
	className?: string;
	title?: string;
	size?: Size;
}) {
	return (
		<button
			type="button"
			data-testid="remove"
			title={title}
			className={`rounded-full text-gray-400 hover:bg-gray-50 hover:text-red-500 p-1 ${className}`}
			onClick={onClick}
		>
			<XMarkIcon className={getButtonSizeClass(size)} />
		</button>
	);
}


