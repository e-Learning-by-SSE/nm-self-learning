import { PencilIcon, PlusIcon } from "@heroicons/react/24/solid";
import { SearchUserDialog } from "@self-learning/admin";
import { trpc } from "@self-learning/api-client";
import {
	IconTextButton,
	LoadingBox,
	OnDialogCloseFn,
	SectionHeader,
	showToast
} from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import { CenteredContainerXL, TopicHeader, Unauthorized } from "@self-learning/ui/layouts";
import { TRPCClientError } from "@trpc/client";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { withTranslations } from "@self-learning/api";
import { GroupRole } from "@prisma/client";
import { ResourceAccessFormSchema } from "@self-learning/types";
import {
	getPermKey,
	GroupPermissionRow,
	GroupPermissionTable,
	GroupMemberRow,
	GroupMemberTable
} from "@self-learning/teaching";

export default function GroupPage() {
	const router = useRouter();
	const { memberName = "" } = router.query;

	const [memberNameFilter, setMemberName] = useState(memberName);

	const [grantGroupAccessDialog, setGrantGroupAccessDialog] = useState(false);
	const { mutateAsync: grantGroupAccess } = trpc.permission.grantGroupAccess.useMutation();

	const handleGrantGroupAccess: OnDialogCloseFn<{
		userId: string;
		role: GroupRole;
		durationMinutes: number;
	}> = async access => {
		setGrantGroupAccessDialog(false);

		try {
			if (access) {
				const r = await grantGroupAccess({
					groupId,
					...access
				});
				showToast({
					type: "success",
					title: "Mitglieder*in hinzugefügt",
					subtitle: `Mitglieder*in "${r.role}" wurde erfolgreich hinzugefügt.`
				});
			}
		} catch (error) {
			console.error(error);

			if (error instanceof TRPCClientError) {
				showToast({ type: "error", title: "Fehler", subtitle: error.message });
			}
		}
	};

	// processing
	// verify groupId
	const groupId = parseInt(router.query.groupId as string);
	// const session = useRequiredSession();
	// const user = session.data?.user;

	const { data: group, isLoading } = trpc.permission.getGroup.useQuery(
		{
			id: groupId
		},
		{
			enabled: !!groupId
		}
	);

	if (isLoading) {
		return <LoadingBox />;
	}

	if (!group) {
		return (
			<Unauthorized>
				<span>Du muss Mitglieder*in dieser Gruppe sein</span>
			</Unauthorized>
		);
	}

	return (
		<div className="flex flex-col gap-8 bg-gray-50 pb-32">
			<TopicHeader
				parentLink="/admin/groups"
				parentTitle="Gruppen"
				title={group.name}
				subtitle={"<placeholder>"}
			>
				<Link
					href={`/teaching/groups/${groupId}/edit`}
					className="btn-primary absolute top-8 w-fit self-end"
				>
					<PencilIcon className="icon h-5" />
					<span>Bearbeiten</span>
				</Link>
			</TopicHeader>

			<CenteredContainerXL>
				{!group ? (
					<LoadingBox />
				) : (
					<>
						<SectionHeader
							title="Mitglieder*innen"
							subtitle="Alle Mitglieder*innen dieser Gruppe."
							button={
								<IconTextButton
									text="Mitglieder*in hinzufügen"
									icon={<PlusIcon className="icon w-5" />}
									onClick={() => setGrantGroupAccessDialog(true)}
								/>
							}
						/>

						{/* TODO not in this PR {grantGroupAccessDialog && (
							<SearchUserDialog
								open={grantGroupAccessDialog}
								onClose={handleGrantGroupAccess}
							/>
						)} */}

						<SearchField
							placeholder="Suche nach Mitglieder*in"
							onChange={e => setMemberName(e.target.value)}
						/>

						<GroupMemberTable>
							{group.members.map(member => (
								<GroupMemberRow key={member.user.id} member={member} />
							))}
						</GroupMemberTable>

						<SectionHeader
							title="Berechtigungen"
							subtitle="Alle Berechtigungen dieser Gruppe."
						/>

						<SearchField
							placeholder="Suche nach Ressourcen"
							onChange={e => setMemberName(e.target.value)}
						/>

						<GroupPermissionTable>
							{group.permissions.map(p => {
								const np = ResourceAccessFormSchema.parse(p);
								return <GroupPermissionRow permission={np} key={getPermKey(np)} />;
							})}
						</GroupPermissionTable>
					</>
				)}
			</CenteredContainerXL>
		</div>
	);

	return;
}

export const getServerSideProps = withTranslations(["common"]);
