export interface TableColumn {
	label: string;
	isDisplayed: boolean;
}

export function TableVisibilityDropdown({
	columns,
	onChange,
	onMouseLeave
}: {
	columns: { [key: string]: TableColumn };
	onChange: ({ key, column }: { key: string; column: TableColumn }) => void;
	onMouseLeave: () => void;
}) {
	const handleCheckboxChange = (key: string) => {
		const column = columns[key];
		onChange({ key, column: { ...column, isDisplayed: !column.isDisplayed } });
	};

	return (
		<div className="absolute bg-white p-4 shadow-md" onMouseLeave={onMouseLeave}>
			{Object.entries(columns).map(([key, column]) => (
				<div key={key} className="flex items-center space-x-2">
					<input
						type="checkbox"
						checked={column.isDisplayed}
						onChange={() => handleCheckboxChange(key)}
						className="form-checkbox rounded text-secondary"
					/>
					<label className="text-gray-700">{column.label}</label>
				</div>
			))}
		</div>
	);
}
