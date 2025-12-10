import React from "react";

export function LabeledCheckbox({
	checked,
	onChange,
	label
}: {
	checked: boolean;
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	label?: string;
}) {
	return (
		<label className={"text-sm"}>
			<span className={"mr-4"}>{label}</span>
			<input
				type="checkbox"
				checked={checked}
				onChange={onChange}
				className={"c-primary form-checkbox rounded text-c-primary focus:ring-c-primary"}
			/>
		</label>
	);
}
