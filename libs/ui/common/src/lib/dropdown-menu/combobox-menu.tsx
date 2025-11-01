import {
	Combobox,
	ComboboxButton,
	ComboboxInput,
	ComboboxOption,
	ComboboxOptions
} from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { useEffect, useMemo, useRef, useState } from "react";
import { MinorScaleFadeIn } from "../transition/minor-scale-fade-in";

/**
 * A searchable dropdown input built with Headless UI's Combobox.
 * It displays a list of options filtered by user input and allows selection of a single item.
 *
 * @component
 *
 * @param {string} title - The title or tooltip for the combobox input.
 * @param {"top" | "bottom"} [dropdownPosition="bottom"] - Position of the dropdown menu relative to the input.
 * @param {(option: string) => void} onChange - Callback invoked when the user selects an option.
 * @param {(focus: boolean) => string} [customFocusStyle] - Optional function to customize the class name when an option is focused.
 * @param {string | null | undefined} displayValue - The current selected value to be displayed in the input field.
 * @param {string[]} options - The list of selectable options.
 *
 * @example
 * <ComboboxMenu
 *   title="Choose a language"
 *   displayValue={selected}
 *   options={["English", "Deutsch", "Español"]}
 *   onChange={setSelected}
 *   customFocusStyle={(focus) => focus ? "bg-emerald-500 text-white" : ""}
 * />
 */
export function ComboboxMenu({
	title,
	dropdownPosition = "bottom",
	customFocusStyle,
	displayValue,
	options,
	onChange
}: {
	title: string;
	dropdownPosition?: "top" | "bottom";
	onChange: (option: string) => void;
	customFocusStyle?: (focus: boolean) => string;
	displayValue: string | null | undefined;
	options: string[];
}) {
	const menuRef = useRef<HTMLInputElement>(null);
	const [menuWidth, setMenuWidth] = useState<number | null>(null);
	const [query, setQuery] = useState("");

	useEffect(() => {
		if (menuRef.current) {
			setMenuWidth(menuRef.current.offsetWidth);
		}
	}, []);

	const filteredOptions = useMemo(() => {
		if (!query) return options;
		return options.filter(option => option.toLowerCase().includes(query.toLowerCase()));
	}, [query, options]);

	const onChangeWrapper = (option: string | null) => {
		if (option) {
			onChange(option);
		}
	};

	return (
		<Combobox
			as="div"
			onChange={onChangeWrapper}
			value={displayValue}
			className="relative inline-block w-full text-left"
		>
			<div className="inline-flex w-full items-center rounded-md border px-4 py-2">
				<ComboboxInput
					ref={menuRef}
					title={title}
					displayValue={() => displayValue ?? ""}
					onChange={e => setQuery(e.target.value)}
					className="w-full focus:outline-none focus:ring-0 focus:ring-offset-0 focus:shadow-none focus:border-gray-300 border-gray-300"
				/>
				<ComboboxButton className="ml-2 text-gray-500 hover:text-gray-700">
					<ChevronUpDownIcon className="w-5 h-5" />
				</ComboboxButton>
			</div>

			{menuWidth && filteredOptions.length > 0 && (
				<MinorScaleFadeIn>
					<ComboboxOptions
						anchor={dropdownPosition}
						style={{ minWidth: menuWidth }}
						className={`z-10 ${
							dropdownPosition === "top" ? "rounded-t" : "rounded-b"
						} bg-white shadow-lg overflow-auto`}
					>
						{filteredOptions.map((option, i) => (
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
				</MinorScaleFadeIn>
			)}
		</Combobox>
	);
}
