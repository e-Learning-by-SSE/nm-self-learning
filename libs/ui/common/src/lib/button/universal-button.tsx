import React, { ReactNode } from "react";

export function UniversalButton({
	onClick,
	title,
	border,
	backgroundColor,
	hover,
	focus,
	size,
	children
}: {
	onClick: () => void;
	title?: string;
	border?: string;
	backgroundColor?: string;
	hover?: string;
	focus?: string;
	size?: string;
	children: ReactNode;
}) {
	return (
		<button
			type="button"
			className={`inline-flex items-center justify-center rounded-md
			${border ? border : "border-1 border-gray-150 border"}
			${backgroundColor ? backgroundColor : "bg-white"}
			${size ? size : "px-4 py-2"}
			${hover ? hover : "hover:bg-gray-100"}
			${focus ? focus : "focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"}
			text-base font-medium text-white `}
			onClick={() => onClick()}
			title={title}
		>
			{children}
		</button>
	);
}
