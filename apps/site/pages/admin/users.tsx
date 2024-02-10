import {
	ImageOrPlaceholder,
	TableDataColumn,
	Table,
	TableHeaderColumn,
	Paginator
} from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import { AdminGuard, CenteredSection, useRequiredSession } from "@self-learning/ui/layouts";
import Link from "next/link";
import { Fragment } from "react";
import { useRouter } from "next/router";
import { trpc } from "@self-learning/api-client";

export default function UsersPage() {
	useRequiredSession();
	const router = useRouter();
	const { title = "", page = 1 } = router.query;

	const { data: users, isLoading } = trpc.admin.getUsers.useQuery(
		{
			page: Number(page)
		},
		{
			staleTime: 10_000,
			keepPreviousData: true
		}
	);

	return (
		<AdminGuard>
			<CenteredSection>
				<div className="mb-16 flex items-center justify-between gap-4">
					<h1 className="text-5xl">Nutzende</h1>
				</div>

				<SearchField
					placeholder="Suche nach Autor"
					onChange={e => {}} //TODO: implement search
				/>

				<Table
					head={
						<>
							<TableHeaderColumn></TableHeaderColumn>
							<TableHeaderColumn>Name</TableHeaderColumn>
							<TableHeaderColumn></TableHeaderColumn>
						</>
					}
				>
					{!isLoading && users && users.result.map(({ name, role }) => (
						<Fragment key={name}>
							{name && (
								<tr key={name}>
									<TableDataColumn>
										{name}
									</TableDataColumn>
									<TableDataColumn>
										{role}
									</TableDataColumn>
									<TableDataColumn>
										<div className="flex flex-wrap justify-end gap-4">
											<button
												className="btn-stroked"
												onClick={() => {}}
											>
												Editieren
											</button>
										</div>
									</TableDataColumn>
								</tr>
							)}
						</Fragment>
					))}
				</Table>
				{!isLoading && users && <Paginator pagination={users} url={`${router.route}?title=${title}`} /> }
			</CenteredSection>
		</AdminGuard>
	);
}
