import { CenteredContainer } from "@self-learning/ui/common";
import { PropsWithChildren } from "react";

export { CenteredContainer };

/**
 * Returns a horizontally centered container with restricted width.
 */
export function CenteredContainerXL({
	children,
	className
}: PropsWithChildren<{ className?: string }>) {
	return (
		<div
			className={`mx-auto w-full max-w-screen-xl px-4 xl:px-0 ${className ? className : ""}`}
		>
			{children}
		</div>
	);
}
