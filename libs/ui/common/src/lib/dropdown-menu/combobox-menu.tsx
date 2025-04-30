import {
	Combobox,
	ComboboxInput,
	ComboboxOption,
	ComboboxOptions,
	ComboboxButton
} from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { useRef } from "react";

export function ComboboxMenu({
	title,
	dropdownPosition = "bottom",
	customFocusStyle,
	value,
	options,
	onChange
}: {
	title: string;
	dropdownPosition?: "top" | "bottom";
	onChange: (option: string) => void;
	customFocusStyle?: (focus: boolean) => string;
	value: string | null | undefined;
	options: string[];
}) {
	const menuRef = useRef<HTMLDivElement>(null);

	return (
		<Combobox
			as="div"
			onChange={onChange}
			value={value}
			className="relative inline-block w-full text-left"
		>
			<div className="inline-flex w-full items-center rounded-md border px-4 py-2" ref={menuRef}>
				<ComboboxInput
					title={title}
					displayValue={() => value ?? "" }
					onChange={e => onChange(e.target.value)}
					className="w-full outline-none"
				/>
				<ComboboxButton className="ml-2 text-gray-500 hover:text-gray-700">
					<ChevronUpDownIcon className="w-5 h-5" />
				</ComboboxButton>
			</div>

			<ComboboxOptions
				anchor={dropdownPosition}
				style={{
					minWidth: menuRef.current?.offsetWidth || "auto",
				}}
				className="z-10 mt-1 rounded-md bg-white shadow-lg overflow-auto text-sm"
			>
				{options.map((option, i) => (
					<ComboboxOption key={i} value={option}>
						{({ focus, selected }) => (
							<div
								className={`w-full text-left px-3 py-1 flex items-center cursor-default ${
									customFocusStyle
										? customFocusStyle(focus)
										: focus
											? "bg-emerald-500 text-white"
											: ""
								} ${selected ? "font-medium" : ""}`}
							>
								{option}
							</div>
						)}
					</ComboboxOption>
				))}
			</ComboboxOptions>
		</Combobox>
	);
}
