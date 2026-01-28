import { PlusIcon } from "@heroicons/react/24/solid";
import { AppRouter, withTranslations } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import {
	LoadingBox,
	Paginator,
	Table,
	TableDataColumn,
	TableHeaderColumn
} from "@self-learning/ui/common";
import { CenteredSection } from "@self-learning/ui/layouts";
import { VoidSvg } from "@self-learning/ui/static";
import { keepPreviousData } from "@tanstack/react-query";
import { inferProcedureOutput } from "@trpc/server";
import Link from "next/link";
import { useRouter } from "next/router";

type FindGroupsData = inferProcedureOutput<AppRouter["permission"]["findGroups"]>;

export default function GroupsPage() {
	const router = useRouter();
	const { page = 1 } = router.query;
	// const [titleFilter, setTitle] = useState(title);
	const { data: allGroups } = trpc.permission.findGroups.useQuery(
		{ /*title: titleFilter as string,*/ page: Number(page) },
		{
			staleTime: 10_000,
			placeholderData: keepPreviousData
		}
	);

	const { data: myGroups } = trpc.permission.findMyGroups.useQuery(
		{ /*title: titleFilter as string,*/ page: Number(page) },
		{
			staleTime: 10_000,
			placeholderData: keepPreviousData
		}
	);

	return (
		<CenteredSection className="bg-gray-50">
			<div className="mb-16 flex items-center justify-between gap-4">
				<h1 className="text-5xl">Meine Gruppen</h1>

				<Link href="/teaching/groups/create" className="btn-primary flex w-fit">
					<PlusIcon className="h-5" />
					<span>Gruppe erstellen</span>
				</Link>
			</div>

			{!myGroups ? <LoadingBox /> : <GroupsPaginatedView data={myGroups} />}

			<div className="mb-16 flex items-center justify-between gap-4">
				<h1 className="text-5xl">Alle Gruppen</h1>

				<Link href="/teaching/groups/create" className="btn-primary flex w-fit">
					<PlusIcon className="h-5" />
					<span>Gruppe erstellen</span>
				</Link>
			</div>

			{/* <SearchField placeholder="Suche nach Name" onChange={e => setTitle(e.target.value)} /> */}

			{!myGroups ? <LoadingBox /> : <GroupsPaginatedView data={allGroups} />}
		</CenteredSection>
	);
}

function GroupsPaginatedView({ data }: { data?: FindGroupsData }) {
	if (!data) {
		return (
			<div className="mx-auto flex items-center gap-8">
				<div className="h-32 w-32">
					<VoidSvg />
				</div>
				<p className="text-light">Gruppen nicht gefunden.</p>
			</div>
		);
	}

	return (
		<>
			<Table
				head={
					<>
						<TableHeaderColumn>Name</TableHeaderColumn>
						<TableHeaderColumn>Anzahl Mitglieder</TableHeaderColumn>
					</>
				}
			>
				{data.result.map(group => (
					<tr key={group.groupId}>
						<TableDataColumn>
							<Link
								className="text-sm font-medium hover:text-secondary"
								href={`/teaching/groups/${group.groupId}`}
							>
								{group.name}
							</Link>
						</TableDataColumn>

						<TableDataColumn>
							<span className="text-light">{group.members.length}</span>
						</TableDataColumn>
					</tr>
				))}
			</Table>
			{data?.result && <Paginator pagination={data} url={`/admin/groups`} />}
		</>
	);
}

export const getServerSideProps = withTranslations(["common"]);
