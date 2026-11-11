import { ArrowsPointingInIcon, PencilIcon, PlusIcon } from "@heroicons/react/24/solid";
import { GroupRole } from "@self-learning/database";
import { UserSearchEntry } from "@self-learning/admin";
import { AppRouter, withTranslations } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import {
	MemberFilter,
	MergeGroupsDialog,
	I18N_NAMESPACE as NS_TEACHING
} from "@self-learning/teaching";
import { MergeGroupsType } from "@self-learning/types";
import {
	IconTextButton,
	I18N_NAMESPACE as NS_UI_COMMON,
	LoadingBox,
	Paginator,
	showToast,
	Table,
	TableDataColumn,
	TableHeaderColumn,
	IconOnlyButton
} from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import {
	CenteredSection,
	MemberGuard,
	useCanCreate,
	useRequiredSession
} from "@self-learning/ui/layouts";
import { VoidSvg } from "@self-learning/ui/static";
import { keepPreviousData } from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import { inferProcedureOutput } from "@trpc/server";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useTranslation } from "next-i18next";

type FindGroupsData = inferProcedureOutput<AppRouter["permission"]["findGroups"]>;

export default function GroupsPage() {
	const router = useRouter();
	const { t } = useTranslation("pages-groups");

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
	const canCreateGroup = useCanCreate();

	const [mergeDialogOpen, setMergeDialogOpen] = useState(false);

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
					title: t("Merge_Success_Title"),
					subtitle: t("Merge_Success_Message", { count: result.groups.length })
				});
			} catch (error) {
				if (error instanceof TRPCClientError) {
					showToast({
						type: "error",
						title: t("Merge_Error_Title"),
						subtitle: t("Merge_Error_Message")
					});
				}
			}
		}
	}

	return (
		<CenteredSection className="bg-gray-50">
			<div className="mb-16 flex items-center justify-between gap-4">
				<h1 className="text-5xl">{t("My_Groups_Title")}</h1>

				<div className="flex gap-2">
					{canCreateGroup && (
						<Link href="/teaching/groups/create" className="btn-primary flex">
							<PlusIcon className="h-5" />
							<span>{t("Create_Group")}</span>
						</Link>
					)}

					<IconTextButton
						text={t("Merge_Groups")}
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
				placeholder={t("Search_Groups_Placeholder")}
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
							<p className="text-light">{t("No_Group_Membership")}</p>
							<u>{t("Become_A_Member")}</u>
						</div>
					</div>
				) : (
					<p className="text-light mb-8">{t("No_Groups_Found")}</p>
				))}

			<div className="mb-16 flex items-center justify-between gap-4">
				<h1 className="text-5xl">{t("All_Groups_Title")}</h1>

				{canCreateGroup && (
					<Link href="/teaching/groups/create" className="btn-primary flex w-fit">
						<PlusIcon className="h-5" />
						<span>{t("Create_Group")}</span>
					</Link>
				)}
			</div>

			<SearchField
				placeholder={t("Search_Groups_Placeholder")}
				onChange={e => setGroupNameFilter(e.target.value)}
			/>

			<MemberFilter value={allGroupMemberFilter} onChange={setAllGroupMemberFilter} />

			{!allGroups ? (
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
	const { t } = useTranslation("pages-groups");
	if (!data) {
		return (
			<div className="mx-auto flex items-center gap-8">
				<div className="h-32 w-32">
					<VoidSvg />
				</div>
				<p className="text-light">{t("No_Groups_Found")}</p>
			</div>
		);
	}

	return (
		<>
			<Table
				head={
					<>
						<TableHeaderColumn>{t("Group_Name_Column")}</TableHeaderColumn>
						<TableHeaderColumn>{t("Member_Count_Column")}</TableHeaderColumn>
						<TableHeaderColumn></TableHeaderColumn>
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

						<TableDataColumn>
							<MemberGuard
								fallback="hidden"
								groupId={group.groupId}
								groupRole={GroupRole.MEMBER}
							>
								<Link href={`/teaching/groups/${group.groupId}/edit`}>
									<IconOnlyButton
										icon={<PencilIcon className="h-5 w-5" />}
										className="btn-stroked"
										title={t("Edit_Group")}
									/>
								</Link>
							</MemberGuard>
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

export const getServerSideProps = withTranslations(
	Array.from(new Set(["common", "pages-groups", ...NS_UI_COMMON, ...NS_TEACHING]))
);
