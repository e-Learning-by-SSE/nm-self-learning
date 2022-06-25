import { PropsWithChildren } from "react";

export function LabeledField({
	children,
	label,
	htmlFor,
	error
}: PropsWithChildren<{ label: string; htmlFor?: string; error?: string }>) {
	return (
		<fieldset className="relative flex w-full flex-col gap-2">
			<label htmlFor={htmlFor}>
				<span className="text-sm font-semibold">{label}</span>
				{error && <span className="px-4 text-xs text-red-500">{error}</span>}
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
