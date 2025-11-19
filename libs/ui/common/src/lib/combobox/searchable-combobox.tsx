import {
	Combobox,
	ComboboxInput,
	ComboboxOptions,
	ComboboxOption,
	ComboboxButton
} from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { Fragment, useState } from "react";

export type SearchableComboboxProps<T> = {
	items: T[];
	initialSelection?: T;
	onChange: (item: T) => void;
	getLabel: (item: T) => string;
	placeholder?: string;
};

/**
 * A searchable combobox component that allows users to select an item from a list.
 */
export function SearchableCombobox<T>({
	items,
	initialSelection,
	onChange,
	getLabel,
	placeholder = "Select item..."
}: {
	items: T[];
	initialSelection?: T;
	onChange: (item?: T) => void;
	getLabel: (item?: T) => string;
	placeholder?: string;
}) {
	const [selected, setSelected] = useState<T | undefined>(initialSelection);
	const [query, setQuery] = useState<string>(initialSelection ? getLabel(initialSelection) : "");
	const [isOpen, setIsOpen] = useState(false);

	const filtered =
		query === ""
			? items
			: items.filter(item => getLabel(item).toLowerCase().includes(query.toLowerCase()));

	const sorted = filtered.sort(
		(a, b) =>
			getLabel(a).toLowerCase().indexOf(query.toLowerCase()) -
			getLabel(b).toLowerCase().indexOf(query.toLowerCase())
	);

	function handleSelect(item: T | null) {
		if (item) {
			setSelected(item);
			setQuery(getLabel(item)); // Update the query to reflect the selected item's label
			onChange(item);
			setIsOpen(false);
		}
	}

	function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
		setQuery(event.target.value ?? "");
		setIsOpen(true);
	}

	function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
		if (event.key === "Enter" && sorted.length > 0) {
			handleSelect(sorted[0]);
		}
	}

	return (
		<Combobox value={selected} onChange={handleSelect} onClose={() => setIsOpen(false)}>
			<div
				className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none"
				onClick={() => setIsOpen(true)}
			>
				<ComboboxInput
					className="w-full border-none py-2 pl-3 pr-10 text-sm text-gray-900 focus:ring-0"
					onChange={handleChange}
					onKeyDown={handleKeyDown}
					value={query}
					placeholder={placeholder}
				/>
				<ComboboxButton
					className="absolute inset-y-0 right-0 flex items-center pr-2"
					onClick={() => setIsOpen(!isOpen)}
				>
					<ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
				</ComboboxButton>
			</div>

			{sorted.length > 0 && (
				<ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5">
					{sorted.map(item => (
						<ComboboxOption key={getLabel(item)} value={item} as={Fragment}>
							{({ active }) => (
								<li
									className={`${
										active ? "bg-emerald-500 text-white" : "text-black"
									} cursor-pointer px-3 py-2`}
								>
									{getLabel(item)}
								</li>
							)}
						</ComboboxOption>
					))}
				</ComboboxOptions>
			)}
		</Combobox>
	);
}
