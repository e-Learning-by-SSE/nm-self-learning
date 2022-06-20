import { PropsWithChildren } from "react";

export function LabeledField({
	children,
	label,
	htmlFor
}: PropsWithChildren<{ label: string; htmlFor?: string }>) {
	return (
		<fieldset className="relative flex w-full flex-col gap-2">
			<label className="text-sm font-semibold" htmlFor={htmlFor}>
				{label}
			</label>
			{children}
		</fieldset>
	);
}

export function FieldError({ error }: { error?: string | null }) {
	if (error) {
		return <p className="absolute left-0 -bottom-5 text-xs text-red-500">{error}</p>;
	}

	return null;
}
