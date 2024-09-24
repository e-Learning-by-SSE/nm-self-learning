import { XMarkIcon } from "@heroicons/react/24/solid";
import { ButtonHTMLAttributes, DetailedHTMLProps } from "react";

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

export function ButtonSmallX({
	onClick,
	className = ""
}: {
	onClick: () => void;
	className?: string;
}) {
	return (
		<button
			type="button"
			data-testid="remove"
			className={`mr-2 rounded-full p-2 hover:bg-gray-50 hover:text-red-500 ${className}`}
			onClick={onClick}
		>
			<XMarkIcon className="h-3" />
		</button>
	);
}
