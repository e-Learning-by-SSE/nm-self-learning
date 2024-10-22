import React, { ReactNode } from "react";

export function UniversalButton({
	onClick,
	title,
	additionalClassNames,
	children
}: {
	onClick: (event?: React.MouseEvent<HTMLButtonElement>) => void;
	title?: string;
	additionalClassNames?: string;
	children: ReactNode;
}) {
	return (
		<button
			type="button"
			className={`border-1 border-gray-150 inline-flex items-center justify-center rounded-md border bg-white px-4 py-2 font-medium text-white hover:bg-gray-100
			${additionalClassNames || ""}`}
			onClick={event => onClick(event)}
			title={title}
		>
			{children}
		</button>
	);
}
