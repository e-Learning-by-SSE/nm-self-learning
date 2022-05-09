import { PropsWithChildren } from "react";
import { CenteredContainer } from "./centered-container";

/**
 * Wrapper for {@link CenteredContainer} that applies some vertical padding.
 */
export function CenteredSection({
	children,
	className
}: PropsWithChildren<{ className?: string }>) {
	return (
		<div className={`py-16 ${className ? className : ""}`}>
			<CenteredContainer>{children}</CenteredContainer>
		</div>
	);
}
