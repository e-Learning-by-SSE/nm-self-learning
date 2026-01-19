import Link from "next/link";
import React, { ReactElement } from "react";

export function Card({
	imageElement,
	title,
	href
}: {
	imageElement: ReactElement;
	title: string;
	href: string;
}) {
	return (
		<Link
			href={href}
			className="flex flex-col place-items-center gap-4 rounded-lg border border-c-border bg-white pt-4"
		>
			<div className="flex aspect-square h-32 w-32 items-center justify-center">
				{React.cloneElement(imageElement, {
					className: "h-full w-full object-contain"
				})}
			</div>
			<span className="w-full rounded-b-lg bg-c-primary hover:bg-c-primary-strong p-4 text-center font-semibold text-white">
				{title}
			</span>
		</Link>
	);
}
