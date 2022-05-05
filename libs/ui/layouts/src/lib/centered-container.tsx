import { PropsWithChildren } from "react";

/**
 * Returns a horizontally centered `flex flex-col` container with restricted width.
 */
export function CenteredContainer({
	children,
	defaultPadding
}: PropsWithChildren<{ defaultPadding?: boolean }>) {
	return (
		<div
			className={`mx-auto flex w-full flex-col gap-8 lg:max-w-screen-lg ${
				defaultPadding ? "py-16 px-4 lg:px-0" : ""
			}`}
		>
			{children}
		</div>
	);
}
