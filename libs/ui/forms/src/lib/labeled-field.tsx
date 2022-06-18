import { PropsWithChildren } from "react";

export function LabeledField({ children, label }: PropsWithChildren<{ label: string }>) {
	return (
		<div className="flex w-full flex-col gap-2">
			<label className="text-sm font-semibold">{label}</label>
			{children}
		</div>
	);
}
