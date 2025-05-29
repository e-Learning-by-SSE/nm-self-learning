import { ButtonHTMLAttributes, DetailedHTMLProps, PropsWithChildren } from "react";
import { PencilIcon, PlusIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { ReactNode } from "react";

type Size = "small" | "medium" | "large";
type Variant = "primary" | "secondary" | "danger" | "tertiary";
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

// Refactored May 2025: Unified button styling using `btn`, `btn-primary`, etc.
export function PrimaryButton(
	props: DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
) {
	return (
		<button {...props} type="button" className={`btn btn-primary ${props.className || ""}`} />
	);
}

// Refactored May 2025: Unified button styling using `btn`, `btn-tertiary`, etc.
export function StrokedButton(
	props: DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
) {
	return (
		<button {...props} type="button" className={`btn btn-tertiary ${props.className || ""}`} />
	);
}

// Refactored May 2025: Unified button styling using `btn`, `btn-danger`, etc.
export function RedButton({
	label,
	onClick,
	className = "",
	...props
}: {
	label: string;
	onClick: () => void;
	className: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
	return (
		<button className={`btn btn-danger rounded-full ${className}`} onClick={onClick} {...props}>
			{label}
		</button>
	);
}

// Refactored May 2025: Standardized GreyBorderButton (btn-secondary)
export function GreyBoarderButton(
	props: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>
) {
	const cl = props.className ? props.className : "px-2 py-2"; // done for compatiblity
	return (
		<button {...props} className={`btn btn-secondary ${cl}`}>
			{props.children}
		</button>
	);
}

/**
 * Button with an icon
 *
 * @example
 * <IconButton text="Edit" icon={<PencilIcon className="h-5" />} />
 */

// Refactored May 2025: Unified button styling using `btn`, `btn-variant`, `button-size`, etc.
export function IconButton({
	icon,
	text,
	size = "medium",
	variant = "primary",
	className = "",
	...props
}: DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
	icon: React.ReactNode;
	text: string;
	size?: Size;
	variant?: Variant;
}) {
	return (
		<button
			type="button"
			className={`btn btn-${variant} flex items-center gap-2 ${className}`}
			{...props}
		>
			{icon}
			<span className={`text-sm ${getButtonSizeClass(size)}`}>{text}</span>
		</button>
	);
}

/**
 * Icon Only Button
 * @example
 * <IconOnlyButton icon={<PlusIcon className="h-5 w-5" />} />
 */

// Refactored May 2025: Unified button styling using `btn`, `btn-primary`, etc.
export function PlusButton({
	onAdd,
	title,
	additionalClassNames,
	size = "medium"
}: {
	onAdd: () => void;
	title: string;
	additionalClassNames?: string;
	size?: Size;
}) {
	return (
		<button
			type="button"
			onClick={onAdd}
			title={title || "Hinzufügen"}
			className={`btn btn-primary p-1 rounded-full ${additionalClassNames || ""}`}
		>
			<PlusIcon className={getButtonSizeClass(size)} />
		</button>
	);
}

// Refactored May 2025: Unified button styling using `btn`, `btn-danger`, etc.
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
			title={title || "Entfernen"}
			className={`btn btn-danger ${additionalClassNames || ""}`}
		>
			{label ? label : <TrashIcon className="h-5 w-5" />}
		</button>
	);
}

// Refactored May 2025: Unified button styling using `btn`, `btn-tertiary`, etc.
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
			onClick={onClick}
			className={`btn btn-tertiary rounded-full p-1 hover:text-red-500 ${className}`}
		>
			<XMarkIcon className={getButtonSizeClass(size)} />
		</button>
	);
}

// Refactored May 2025: Unified button styling using `btn`, `btn-tertiary`, etc.
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
		<GreyBoarderButton
			onClick={onClick}
			title={title}
			type="button"
			className="btn btn-tertiary"
		>
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
