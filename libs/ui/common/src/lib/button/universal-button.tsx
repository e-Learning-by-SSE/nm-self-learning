import React, { ReactNode } from "react";

export function UniversalButton({
	onClick,
	title,
	border,
	backgroundColor,
	hover,
	focus,
	size,
	additionalClassNames,
	children
}: {
	onClick: (event?: React.MouseEvent<HTMLButtonElement>) => void; // Allow onClick to optionally accept a MouseEvent
	title?: string;
	border?: string;
	backgroundColor?: string;
	hover?: string;
	focus?: string;
	size?: string;
	additionalClassNames?: string;
	children: ReactNode;
}) {
	return (
		<button
			type="button"
			className={`inline-flex items-center justify-center rounded-md
			 ${border || "border-1 border-gray-150 border"}
			 ${backgroundColor || "bg-white"}
			 ${size || "px-4 py-2"}
			 ${hover || "hover:bg-gray-100"}
			 ${focus || "focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"}
			 ${additionalClassNames || ""}
			 font-medium text-white `}
			onClick={event => onClick(event)} // Pass the event to onClick
			title={title}
		>
			{children}
		</button>
	);
}
