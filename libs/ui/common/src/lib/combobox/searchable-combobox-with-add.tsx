import { useState } from "react";
import { SearchableCombobox } from "./searchable-combobox";

export type SearchableComboboxWithAddProps<T> = {
	items: T[];
	initialSelection?: T;
	onChange: (item?: T) => void;
	onAdd: (label: string) => void;
	getLabel: (item?: T) => string;
	placeholder?: string;
	addButtonLabel?: string;
};

export function SearchableComboboxWithAdd<T>({
	items,
	initialSelection,
	onChange,
	onAdd,
	getLabel,
	placeholder = "Select or add...",
	addButtonLabel = "Add new"
}: SearchableComboboxWithAddProps<T>) {
	const [inputValue, setInputValue] = useState("");

	function handleAddClick() {
		if (inputValue.trim()) {
			onAdd(inputValue.trim());
			setInputValue("");
		}
	}

	return (
		<div className="space-y-2">
			<SearchableCombobox
				items={items}
				initialSelection={initialSelection}
				onChange={onChange}
				getLabel={getLabel}
				placeholder={placeholder}
			/>

			<div className="flex gap-2">
				<input
					type="text"
					value={inputValue}
					onChange={e => setInputValue(e.target.value)}
					className="flex-1 rounded border px-2 py-1 text-sm"
					placeholder="New item..."
				/>
				<button
					onClick={handleAddClick}
					className="rounded bg-c-primary px-3 py-1 text-sm text-white hover:bg-emerald-600"
				>
					{addButtonLabel}
				</button>
			</div>
		</div>
	);
}
