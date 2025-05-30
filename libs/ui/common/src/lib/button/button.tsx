import { ButtonHTMLAttributes, DetailedHTMLProps, PropsWithChildren } from "react";
import { PencilIcon, PlusIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { ReactNode } from "react";

// No changes - already works with CSS
export function PrimaryButton(
	props: DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
) {
	return <button {...props} type="button" className="btn-primary" />;
}

// No changes - works fine
export function StrokedButton(
	props: DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
) {
	return <button {...props} type="button" className="btn-stroked" />;
}

// Fixed: Added missing backticks for template literal
export function RedButton({
	label,
	onClick,
	className = "",
	...props
}: {
	label: string;
	onClick: () => void;
	className?: string; // Made optional to match usage
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
	return (
		<button
			className={`btn-destructive ${className}`} // Now uses unified CSS
			onClick={onClick}
			{...props}
		>
			{label}
		</button>
	);
}

// Fixed: Added missing backticks and improved
export function GreyBoarderButton(
	props: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>
) {
	const cl = props.className ? props.className : "px-2 py-2"; // Keep compatibility
	return (
		<button
			{...props}
			className={`btn-tertiary ${cl}`} // Now uses unified CSS in styles.css
			type="button" // Ensure type is button
		>
			{props.children}
		</button>
	);
}

/**
 * Button with an icon - NOW WITH RESPONSIVE TEXT!
 * Text disappears on small screens, only icon visible
 *
 * @example
 * <IconButton text="Edit" icon={<PencilIcon className="h-5" />} />
 */
export function IconButton(
	props: DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
		icon: React.ReactNode;
		text: string;
		hideTextOnMobile?: boolean; // New optional prop
	}
) {
	const { hideTextOnMobile = true, ...buttonProps } = props;
	const textClasses = hideTextOnMobile ? "hidden sm:inline" : "";

	return (
		<button
			type="button"
			className="btn-primary btn-with-icon" // Now uses unified CSS
			{...buttonProps}
		>
			{props.icon}
			<span className={`text-sm ${textClasses}`}>{props.text}</span>
		</button>
	);
}

/**
 * Icon only button
 * @example
 * <IconOnlyButton icon={<PlusIcon className="h-5" />} onClick={() => {}} />
 */

// keeping original utility - works perfectly
type Size = "small" | "medium" | "large";

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

// Fixed: Added missing backticks
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
			className={`btn-small-highlight ${additionalClassNames || ""}`}
		>
			<PlusIcon className={getButtonSizeClass(size)} />
		</button>
	);
}

// Fixed: Added missing backticks + now uses unified CSS
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
			className={`btn-destructive ${additionalClassNames || ""}`}
		>
			{label ? label : <TrashIcon className="h-5 w-5" />}
		</button>
	);
}

// Fixed: Added missing backticks
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

// No changes - works fine with GreyBoarderButton
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
