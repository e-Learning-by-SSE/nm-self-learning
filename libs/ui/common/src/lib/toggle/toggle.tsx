import { Label, Switch, Field } from "@headlessui/react";

export function Toggle({
	value,
	onChange,
	label,
	disabled,
	testid
}: {
	value: boolean;
	onChange: (value: boolean) => void;
	label: string;
	disabled?: boolean;
	testid?: string;
}) {
	return (
		<Field>
			<div className="inline-flex cursor-pointer items-center" data-testid={testid}>
				<Switch
					checked={value}
					onChange={onChange}
					disabled={disabled}
					className={`relative inline-flex h-6 w-11 items-center rounded-full
						transition-colors focus:outline-none focus:ring-2
						focus:ring-secondary focus:ring-offset-2
						disabled:cursor-not-allowed disabled:opacity-50
						${value ? "bg-secondary" : "bg-gray-200 dark:bg-gray-700"}`}
				>
					<span
						className={`inline-block h-5 w-5 transform rounded-full
							bg-white transition-transform
							${value ? "translate-x-[22px] border-white" : "translate-x-[2px] border-gray-300"}`}
					/>
				</Switch>
				<Label className="ml-2 cursor-pointer">{label}</Label>
			</div>
		</Field>
	);
}
