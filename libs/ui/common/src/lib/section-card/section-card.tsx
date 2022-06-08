import { PropsWithChildren } from "react";

export function SectionCard({
	children,
	title,
	subtitle
}: PropsWithChildren<{ title: string; subtitle?: string | null }>) {
	return (
		<div className="card grid w-full items-start rounded-lg border border-light-border bg-white">
			<div className="mb-8 grid items-start gap-2">
				<h2 className="text-2xl">{title}</h2>
				{subtitle && <span className="text-light">{subtitle}</span>}
			</div>
			{children}
		</div>
	);
}
