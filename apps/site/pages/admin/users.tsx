import {
	TableDataColumn,
	Table,
	TableHeaderColumn,
	Paginator,
	ImageOrPlaceholder
} from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import { AdminGuard, CenteredSection, useRequiredSession } from "@self-learning/ui/layouts";
import { Fragment } from "react";
import { useRouter } from "next/router";
import { trpc } from "@self-learning/api-client";

export default function UsersPage() {
	useRequiredSession();
	const router = useRouter();
	const { title = "", page = 1 } = router.query;

	const { data: users, isLoading } = trpc.admin.getUsers.useQuery(
		{
			page: Number(page),
			title: title as string
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
					onChange={e => {
						router.push(
							{
								query: {
									title: e.target.value,
									page: 1
								}
							},
							undefined,
							{ shallow: true }
						);
					}}
				/>

				<Table
					head={
						<>
							<TableHeaderColumn></TableHeaderColumn>
							<TableHeaderColumn>Name</TableHeaderColumn>
							<TableHeaderColumn>Role</TableHeaderColumn>
							<TableHeaderColumn></TableHeaderColumn>
						</>
					}
				>
					{!isLoading &&
						users &&
						users.result.map(({ name, role, image }) => (
							<Fragment key={name}>
								{name && (
									<tr key={name}>
										<TableDataColumn>
											<ImageOrPlaceholder
												src={image ?? undefined}
												className="m-0 h-10 w-10 rounded-lg object-cover"
											/>
										</TableDataColumn>
										<TableDataColumn>{name}</TableDataColumn>
										<TableDataColumn>
											<RoleLabel role={role} />
										</TableDataColumn>
										<TableDataColumn>
											<div className="flex flex-wrap justify-end gap-4">
												<button className="btn-stroked" onClick={() => {}}>
													Editieren
												</button>
											</div>
										</TableDataColumn>
									</tr>
								)}
							</Fragment>
						))}
				</Table>
				{!isLoading && users && (
					<Paginator pagination={users} url={`${router.route}?title=${title}`} />
				)}
			</CenteredSection>
		</AdminGuard>
	);
}

function RoleLabel({ role }: { role: string }) {
	if (role === "USER") return;

	let roleColor = "bg-secondary";

	if (role === "ADMIN") {
		roleColor = "bg-red-500";
	}

	return <span className={`rounded-full ${roleColor} px-3 py-[2px] text-white`}>{role}</span>;
}
