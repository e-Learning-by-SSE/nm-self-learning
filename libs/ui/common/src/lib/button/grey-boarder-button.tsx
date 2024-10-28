import React, { ButtonHTMLAttributes, PropsWithChildren } from "react";

export function GreyBoarderButton(
	props: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>
) {
	return (
		<button
			{...props}
			className="border-1 border-gray-150 inline-flex items-center justify-center rounded-md border bg-white px-4 py-2 font-medium text-white hover:bg-gray-100"
		>
			{props.children}
		</button>
	);
}
