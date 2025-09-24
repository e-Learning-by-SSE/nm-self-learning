import { ButtonHTMLAttributes, DetailedHTMLProps } from "react";

export type ButtonVariant = "primary" | "secondary" | "danger" | "tertiary" | "x-mark" | "stroked";

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
	variant?: ButtonVariant;
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
	variant?: ButtonVariant;
}) {
	const baseClasses = "btn btn-icon-only";
	const variantClass = `btn-${variant}`;

	return (
		<button type="button" className={`${baseClasses} ${variantClass} ${className}`} {...props}>
			{icon}
		</button>
	);
}
