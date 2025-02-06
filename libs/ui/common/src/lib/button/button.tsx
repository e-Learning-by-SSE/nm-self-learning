import { ButtonHTMLAttributes, DetailedHTMLProps, PropsWithChildren } from "react";

export function PrimaryButton(
	props: DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
) {
	return <button {...props} type="button" className="btn-primary" />;
}

export function StrokedButton(
	props: DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
) {
	return <button {...props} type="button" className="btn-stroked" />;
}

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
		<button
			className={`btn rounded-full bg-red-500 px-4 py-2 text-white hover:bg-red-600 focus:ring-4 focus:ring-red-300 ${className}`}
			onClick={onClick}
			{...props}
		>
			{label}
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
			data-testid="author-option"
			{...props}
			className={`border-1 border-gray-150 inline-flex items-center justify-center rounded-md border bg-white font-medium text-black hover:bg-gray-100 ${cl}`}
		>
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
export function IconButton(
	props: DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
		icon: React.ReactNode;
		text: string;
	}
) {
	return (
		<button
			type="button"
			className="flex place-content-center items-center gap-4 rounded-lg bg-emerald-500 py-2 pl-4 pr-6 font-semibold text-white transition-colors hover:bg-emerald-600 disabled:bg-opacity-25"
			{...props}
		>
			{props.icon}
			<span className="text-sm">{props.text}</span>
		</button>
	);
}
