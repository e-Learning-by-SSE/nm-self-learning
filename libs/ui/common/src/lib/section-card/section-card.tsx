import { ReactNode } from "react";

export function SectionCard({ children, className }: { children: ReactNode; className?: string }) {
	return (
		<div
			className={`card relative grid w-full items-start rounded-lg border border-light-border bg-white ${
				className ?? ""
			}`}
		>
			{children}
		</div>
	);
}

export function SectionCardHeader({
	title,
	subtitle
}: {
	title: string;
	subtitle?: string | null;
}) {
	return (
		<div className="grid items-start gap-2">
			<h2 className="text-2xl">{title}</h2>
			{subtitle && <span className="text-light">{subtitle}</span>}
		</div>
	);
}

export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string | null }) {
	return (
		<div className="mb-8 grid items-start gap-4">
			<h2 className="text-4xl">{title}</h2>
			{subtitle && <p className="text-light">{subtitle}</p>}
		</div>
	);
}
