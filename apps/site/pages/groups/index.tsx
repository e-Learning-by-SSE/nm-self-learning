import { ArrowsPointingInIcon, PlusIcon } from "@heroicons/react/24/solid";
import { UserSearchEntry } from "@self-learning/admin";
import { AppRouter, withTranslations } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { MemberFilter, MergeGroupsDialog } from "@self-learning/teaching";
import { MergeGroupsType } from "@self-learning/types";
import {
	IconTextButton,
	I18N_NAMESPACE as NS_UI_COMMON,
	LoadingBox,
	Paginator,
	showToast,
	Table,
	TableDataColumn,
	TableHeaderColumn
} from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import { CenteredSection, useRequiredSession } from "@self-learning/ui/layouts";
import { VoidSvg } from "@self-learning/ui/static";
import { keepPreviousData } from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import { inferProcedureOutput } from "@trpc/server";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

type FindGroupsData = inferProcedureOutput<AppRouter["permission"]["findGroups"]>;

export default function GroupsPage() {
	const router = useRouter();

	const [myGroupNameFilter, setMyGroupNameFilter] = useState("");
	const [groupNameFilter, setGroupNameFilter] = useState("");

	const [allGroupsPage, setAllGroupsPage] = useState(1);
	const [myGroupsPage, setMyGroupsPage] = useState(1);

	const [myGroupMemberFilter, setMyGroupMemberFilter] = useState<UserSearchEntry[]>([]);
	const [allGroupMemberFilter, setAllGroupMemberFilter] = useState<UserSearchEntry[]>([]);

	const { data: allGroups } = trpc.permission.findGroups.useQuery(
		{
			page: Number(allGroupsPage),
			isGlobal: true,
			name: groupNameFilter,
			members: allGroupMemberFilter.map(m => m.id)
		},
		{
			staleTime: 10_000,
			placeholderData: keepPreviousData
		}
	);

	const { data: myGroups } = trpc.permission.findGroups.useQuery(
		{
			page: Number(myGroupsPage),
			isGlobal: false,
			name: myGroupNameFilter,
			members: myGroupMemberFilter.map(m => m.id)
		},
		{
			staleTime: 10_000,
			placeholderData: keepPreviousData
		}
	);

	const { mutateAsync: mergeGroups } = trpc.permission.mergeGroups.useMutation();

	const session = useRequiredSession();
	const isAdmin = session.data?.user.role === "ADMIN";

	const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
	const [groupSearchDialogOpen, setGroupSearchDialogOpen] = useState(false);

	if (!router.isReady) {
		return <LoadingBox />;
	}

	async function onMergeGroups(result?: MergeGroupsType) {
		setMergeDialogOpen(false);

		if (result && result.groups.length > 1) {
			try {
				const res = {
					name: result.name,
					slug: result.slug,
					strategy: result.strategy,
					groupIds: result.groups.map(g => g.groupId)
				};
				await mergeGroups(res);
				showToast({
					type: "success",
					title: "Gruppen zusammengeführt",
					subtitle: `Die ausgewählten Gruppen (${result.groups.length}) wurden erfolgreich zusammengeführt.`
				});
			} catch (error) {
				if (error instanceof TRPCClientError) {
					showToast({
						type: "error",
						title: "Fehler",
						subtitle: "Die Gruppen konnten nicht zusammengeführt werden."
					});
				}
			}
		}
	}

	return (
		<CenteredSection className="bg-gray-50">
			<div className="mb-16 flex items-center justify-between gap-4">
				<h1 className="text-5xl">Meine Gruppen</h1>

				<div className="flex gap-2">
					<Link href="/teaching/groups/create" className="btn-primary flex">
						<PlusIcon className="h-5" />
						<span>Gruppe erstellen</span>
					</Link>

					<IconTextButton
						text="Gruppen zusammenführen"
						icon={<ArrowsPointingInIcon className="icon w-5" />}
						onClick={() => setMergeDialogOpen(true)}
						className="btn-primary"
						hideTextOnMobile={true}
					/>
				</div>
			</div>
			{mergeDialogOpen && (
				<MergeGroupsDialog
					isOpen={mergeDialogOpen}
					onClose={onMergeGroups}
					isGlobal={isAdmin}
				/>
			)}

			<SearchField
				placeholder="Suche nach Gruppe"
				onChange={e => setMyGroupNameFilter(e.target.value)}
			/>

			<MemberFilter value={myGroupMemberFilter} onChange={setMyGroupMemberFilter} />

			{!myGroups && <LoadingBox />}
			{myGroups && myGroups.totalCount > 0 && (
				<GroupsPaginatedView data={myGroups} setPage={setMyGroupsPage} />
			)}
			{myGroups?.totalCount === 0 &&
				(myGroupNameFilter === "" && myGroupMemberFilter.length === 0 ? (
					<div className="mx-auto flex items-center gap-8 pb-8">
						<div className="h-32 w-32">
							<VoidSvg />
						</div>
						<div>
							<p className="text-light">Sie sind Mitglied keiner Gruppe.</p>
							<u>Become a member</u>
						</div>
					</div>
				) : (
					<p className="text-light mb-8">Gruppen nicht gefunden.</p>
				))}

			<div className="mb-16 flex items-center justify-between gap-4">
				<h1 className="text-5xl">Alle Gruppen</h1>

				<Link href="/teaching/groups/create" className="btn-primary flex w-fit">
					<PlusIcon className="h-5" />
					<span>Gruppe erstellen</span>
				</Link>
			</div>

			<SearchField
				placeholder="Suche nach Gruppe"
				onChange={e => setGroupNameFilter(e.target.value)}
			/>

			<MemberFilter value={allGroupMemberFilter} onChange={setAllGroupMemberFilter} />

			{!myGroups ? (
				<LoadingBox />
			) : (
				<GroupsPaginatedView data={allGroups} setPage={setAllGroupsPage} />
			)}

			{/* <IconTextButton
				icon={<MagnifyingGlassIcon className="icon h-5" />}
				text={"Erweiterte Suche"}
				className="btn-secondary mt-4"
				onClick={() => setGroupSearchDialogOpen(true)}
			/>
			{groupSearchDialogOpen && (
				<MergeGroupsDialog
					isOpen={groupSearchDialogOpen}
					onClose={onGroupFound}
					isGlobal={true}
				/>
			)} */}
		</CenteredSection>
	);
}

function GroupsPaginatedView({
	data,
	setPage
}: {
	data?: FindGroupsData;
	setPage: (page: number) => void;
}) {
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
			{data?.result && (
				<Paginator pagination={data} url={`/admin/groups?title=`} onPageChange={setPage} />
			)}
		</>
	);
}

export const getServerSideProps = withTranslations(Array.from(new Set(["common", ...NS_UI_COMMON])));
