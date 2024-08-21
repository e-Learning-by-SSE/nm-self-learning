import React from "react";
import { LearningDiaryEntriesOverview } from "@self-learning/api";

export function Table({ head, children }: { head: React.ReactElement; children: React.ReactNode }) {
	return (
		<div className="overflow-auto rounded-lg border-x border-b border-light-border bg-white">
			<table className="w-full table-auto">
				<thead className="sticky top-0 z-10 rounded-lg border-y border-light-border bg-gray-100">
					<tr>{head}</tr>
				</thead>
				<tbody className="divide-y divide-light-border">{children}</tbody>
			</table>
		</div>
	);
}

export function TableHeaderColumn({ children }: { children?: React.ReactNode }) {
	return (
		<th className="border-y border-light-border py-4 px-8 text-start text-sm font-semibold">
			{children}
		</th>
	);
}

export function TableDataColumn({
	children,
	className
}: {
	children?: React.ReactNode;
	className?: string;
}) {
	return <td className={className ?? "py-2 px-8 text-sm"}>{children}</td>;
}

export interface TableColumn {
	label: string;
	sortingFunction: (a: LearningDiaryEntriesOverview, b: LearningDiaryEntriesOverview) => number;
	isDisplayed: boolean;
}

export function DropdownMenu({
	columns,
	setColumns,
	setChevronMenu
}: {
	columns: Map<string, TableColumn>;
	setColumns: React.Dispatch<React.SetStateAction<Map<string, TableColumn>>>;
	setChevronMenu: React.Dispatch<React.SetStateAction<boolean>>;
}) {
	const handleCheckboxChange = (key: string) => {
		setColumns(prevColumns => {
			const newColumns = new Map(prevColumns);
			const column = newColumns.get(key);
			if (column) {
				newColumns.set(key, { ...column, isDisplayed: !column.isDisplayed });
			}
			return newColumns;
		});
	};

	return (
		<div
			className="absolute bg-white p-4 shadow-md"
			onMouseLeave={() => {
				setChevronMenu(false);
			}}
		>
			{[...columns.values()].map(column => {
				const columnKey = findKeyByValue(columns, column);

				return (
					<div key={columnKey} className="flex items-center space-x-2">
						<input
							type="checkbox"
							checked={column.isDisplayed}
							onChange={() => handleCheckboxChange(columnKey)}
							className="form-checkbox rounded text-secondary"
						/>
						<label className="text-gray-700">{column.label}</label>
					</div>
				);
			})}
		</div>
	);
}

export function findKeyByValue(map: Map<string, TableColumn>, targetValue: TableColumn): string {
	for (const [key, value] of map.entries()) {
		if (value === targetValue) {
			return key;
		}
	}
	return "";
}
