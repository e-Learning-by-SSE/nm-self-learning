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

	return (
		<Combobox
			as="div"
			onChange={onChange}
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
