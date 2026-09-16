import { ButtonHTMLAttributes, DetailedHTMLProps, PropsWithChildren } from "react";

/**
 * @deprecated since 2025-12
 * Use className="btn-primary" etc. inside the IconButton instead
 */
export type ButtonVariant = "primary" | "secondary" | "danger" | "tertiary" | "x-mark" | "stroked";

/**
 * Enhanced Icon Button with responsive text
 * Text disappears on small viewports, only icon remains visible
 *
 * @example
 * <IconTextButton text="Edit" icon={<PencilIcon className="h-5" />} className="btn-primary" />
 * <IconTextButton text="Delete" icon={<TrashIcon className="h-5" />} className="btn-danger" />
 */
export function IconTextButton({
	icon,
	text,
	hideTextOnMobile = true,
	className = "",
	...props
}: DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
	icon: React.ReactNode;
	text: string;
	hideTextOnMobile?: boolean;
}) {
	const baseClasses = "btn btn-with-icon";
	const textClasses = hideTextOnMobile ? "hidden sm:inline" : "";

	return (
		<button type="button" className={`${baseClasses} ${className}`} {...props}>
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
	className = "",
	...props
}: DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
	icon: React.ReactNode;
}) {
	const baseClasses = "btn btn-icon-only text-c-text-muted";

	return (
		<button type="button" className={`${baseClasses} ${className}`} {...props}>
			{icon}
		</button>
	);
}

export function GreyBoarderButton(
	props: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>
) {
	const cl = props.className ? props.className : "px-2 py-2"; // done for compatiblity
	return (
		<button
			type="button"
			{...props}
			className={`border-1 border-gray-150 inline-flex items-center justify-center rounded-md border bg-white font-medium text-black hover:bg-gray-100 ${cl}`}
		>
			{props.children}
		</button>
	);
}
