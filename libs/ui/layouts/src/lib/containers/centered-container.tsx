import { PropsWithChildren } from "react";

/**
 * Returns a horizontally centered container with restricted width.
 */
export function CenteredContainer({
	children,
	className
}: PropsWithChildren<{ className?: string }>) {
	return (
		<div
			className={`mx-auto w-full max-w-screen-lg px-4 xl:px-0 ${className ? className : ""}`}
		>
			{children}
		</div>
	);
}
