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
			className="flex shrink-0 items-center gap-1 rounded-full border border-light-border  bg-white p-1 px-3 text-gray-400 transition-colors hover:bg-secondary hover:text-white"
			{...props}
		>
			{props.icon}
			<span className="text-xs">{props.text}</span>
		</button>
	);
}
