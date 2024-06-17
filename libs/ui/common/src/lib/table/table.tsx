import React, { useState, useMemo } from "react";

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

export function SortableTable({
	data,
	columns
}: {
	data: { [key: string]: { component: React.ReactNode; sortValue: string | number } }[];
	columns: { key: string; label: string }[];
}) {
	const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: "asc" | "desc" }>(
		{
			key: null,
			direction: "asc"
		}
	);

	const sortedData = useMemo(() => {
		if (sortConfig.key) {
			return [...data].sort((a, b) => {
				const aValue = a[sortConfig.key!].sortValue;
				const bValue = b[sortConfig.key!].sortValue;
				if (aValue < bValue) {
					return sortConfig.direction === "asc" ? -1 : 1;
				}
				if (aValue > bValue) {
					return sortConfig.direction === "asc" ? 1 : -1;
				}
				return 0;
			});
		}
		return data;
	}, [data, sortConfig]);

	const handleSort = (key: string) => {
		let direction: "asc" | "desc" = "asc";
		if (sortConfig.key === key && sortConfig.direction === "asc") {
			direction = "desc";
		}
		setSortConfig({ key, direction });
	};

	return (
		<Table
			head={
				<>
					{columns.map((column, index) => (
						<TableHeaderColumn key={column.key}>
							<div
								onClick={() => handleSort(column.key)}
								className={`flex cursor-pointer items-center ${
									index === columns.length - 1 ? "w-36" : ""
								} hover:text-secondary`}
							>
								<span
									className={`mr-2 ${
										sortConfig.key === column.key ? "inline-block" : "invisible"
									}`}
								>
									{sortConfig.direction === "asc" ? "▲" : "▼"}
								</span>
								<span>{column.label}</span>
							</div>
						</TableHeaderColumn>
					))}
				</>
			}
		>
			{sortedData.map((row, rowIndex) => (
				<tr key={rowIndex}>
					{columns.map(column => (
						<TableDataColumn
							key={column.key}
							className={column.key === "status" ? "w-36" : ""}
						>
							{row[column.key].component}
						</TableDataColumn>
					))}
				</tr>
			))}
		</Table>
	);
}
