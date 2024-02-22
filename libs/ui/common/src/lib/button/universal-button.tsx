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
			className={`inline-flex items-center justify-center rounded-md ${
				border ? border : "border border-transparent"
			} ${backgroundColor ? backgroundColor : "bg-white"} ${
				size ? size : "px-4 py-2"
			} text-base font-medium text-white ${hover ? hover : "hover:bg-gray-100"} ${
				focus ? focus : "focus:primary focus:outline-none focus:ring-2 focus:ring-offset-2"
			}`}
			onClick={() => onClick()}
			aria-label="Delete"
			title={title}
		>
			<div>{children}</div>
		</button>
	);
}
