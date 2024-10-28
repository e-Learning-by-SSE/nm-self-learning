import React from "react";

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

/**
 * May be used as part of the children of a sorted TableHeaderColumn to indicate the sorting direction.
 * @param key An identifier used for the column at which the sorting indicator should be displayed.
 * @param sortConfig The sorting configuration of the complete table.
 * @returns A visible sign that shows how the column is currently sorted or an empty place holder.
 * 
 * @example
 * ```tsx
 * const [sortConfig, setSortConfig] = 
 *     useState<{key: string | null; direction: "ascending" | "descending"}>
 *     ({ key: null, direction: "ascending" });
 * ...
 * 
 * <TableHeaderColumn onClick={() => sortData("title")}>
 *    Titel {SortIndicator("title", sortConfig)}
	</TableHeaderColumn>
 * ```
 */
export function SortIndicator({
	columnId,
	sortConfig
}: {
	columnId: string;
	sortConfig: { key: string | null; direction: "ascending" | "descending" };
}) {
	if (sortConfig.key !== columnId) {
		// Use the same space to avoid layout shifts; invisible content should not be read by screen readers
		// See for alternative symbols: https://www.compart.com/de/unicode/block/U+25A0
		return <span className="px-2 invisible">▲</span>;
	}
	const icon = sortConfig.direction === "ascending" ? "▲" : "▼";
	return <span className="px-2">{icon}</span>;
}

export function TableHeaderColumn({
	children,
	onClick
}: {
	children?: React.ReactNode;
	onClick?: () => void;
}) {
	return (
		<th
			className="border-y border-light-border py-4 px-8 text-start text-sm font-semibold"
			onClick={onClick}
		>
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
