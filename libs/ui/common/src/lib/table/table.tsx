export function Table({ head, children }: { head: React.ReactElement; children: React.ReactNode }) {
	return (
		<div className="light-border overflow-auto rounded-lg border-x border-b bg-white">
			<table className="w-full table-auto">
				<thead className="rounded-lg border-b border-b-light-border bg-gray-100">
					<tr className="border-t">{head}</tr>
				</thead>
				<tbody className="divide-y divide-light-border">{children}</tbody>
			</table>
		</div>
	);
}

export function TableHeaderColumn({ children }: { children?: React.ReactNode }) {
	return <th className="py-4 px-8 text-start text-sm font-semibold">{children}</th>;
}

export function TableDataColumn({ children }: { children?: React.ReactNode }) {
	return <td className="py-4 px-8 text-sm">{children}</td>;
}
