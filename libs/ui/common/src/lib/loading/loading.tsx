/** Empty container with `animate-pulse` animation. Can be used to indicate that content is loading. */
export function LoadingBox({ height }: { height?: string | number }) {
	return (
		<div
			style={{ height: height ?? 500 }}
			className="h-full animate-pulse rounded-lg bg-gray-100"
		></div>
	);
}
