import { PropsWithChildren } from "react";

/**
 * Returns a horizontally centered container with restricted width.
 */
export function CenteredContainer({
	children,
	className
}: PropsWithChildren<{ className?: string }>) {
	return (
		<div className={`mx-auto px-4 lg:max-w-screen-lg xl:px-0 ${className ? className : ""}`}>
			{children}
		</div>
	);
}
