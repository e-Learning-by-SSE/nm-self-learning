import { PropsWithChildren, ReactNode } from "react";

export function LabeledField({
	children,
	label,
	htmlFor,
	error,
	optional,
	disabled,
	button
}: PropsWithChildren<{
	label: string;
	htmlFor?: string;
	error?: string;
	optional?: boolean;
	disabled?: boolean;
	button?: ReactNode;
}>) {
	return (
		<fieldset
			className={`relative flex w-full flex-col gap-1 ${
				disabled ? "" /*"pointer-events-none opacity-50"*/ : ""
			}`}
			disabled={disabled}
		>
			<label htmlFor={htmlFor}>
				<div className={"flex items-center justify-between"}>
					<div className="flex items-center gap-2">
						<span className="text-sm font-semibold">{label}</span>
						{optional && <span className="text-xs text-light">(optional)</span>}
					</div>
					{button ? button : null}
				</div>
				{error && <span className="text-xs text-red-500">{error}</span>}
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

export function FieldHint({ children }: { children?: ReactNode }) {
	return <p className="text-xs text-light">{children}</p>;
}
