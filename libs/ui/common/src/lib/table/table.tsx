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
