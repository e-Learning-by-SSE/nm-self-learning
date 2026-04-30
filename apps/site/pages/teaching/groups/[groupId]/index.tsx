import { PencilIcon } from "@heroicons/react/24/solid";
import { trpc } from "@self-learning/api-client";
import { LoadingBox, OnDialogCloseFn, SectionHeader } from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import { CenteredContainerXL, TopicHeader, Unauthorized } from "@self-learning/ui/layouts";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { withTranslations } from "@self-learning/api";
import { ResourceAccessFormSchema } from "@self-learning/types";
import {
	getPermKey,
	GroupPermissionRow,
	GroupPermissionTable,
	GroupMemberRow,
	GroupMemberTable,
	GroupDeleteOption,
	GroupPermissionRelationsDialog,
	PermissionFormModel
} from "@self-learning/teaching";

export default function GroupPage() {
	const router = useRouter();
	const { memberName = "" } = router.query;

	const [memberNameFilter, setMemberName] = useState(memberName);
    const [resourceNameFilter, setResourceNameFilter] = useState("");

	const [selectedPermission, setSelectedPermission] = useState<PermissionFormModel | undefined>(
		undefined
	);
	const handleRelationsDialogClose: OnDialogCloseFn<PermissionFormModel> = () => {
		setSelectedPermission(undefined);
	};

	// processing
	// verify groupId
	const groupId = parseInt(router.query.groupId as string);

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

    // Optional filtered list of group members based on memberNameFilter
    const memberNameFilterString =
	typeof memberNameFilter === "string" ? memberNameFilter.toLowerCase().trim() : "";
    const filteredMembers = group.members.filter(member => {
        const name = member.user.displayName.toLowerCase() ?? "";
        const email = member.user.email?.toLowerCase() ?? "";

        return (
            name.includes(memberNameFilterString) ||
            email.includes(memberNameFilterString)
        );
    });

    // Optional filtered list of resources based on resourceNameFilter
    const resourceNameFilterString = resourceNameFilter.toLowerCase().trim();
    const filteredResources = group.permissions.filter(p => {
        const permission = ResourceAccessFormSchema.parse(p);

        return JSON.stringify(permission)
            .toLowerCase()
            .includes(resourceNameFilterString);
    });

	return (
		<div className="flex flex-col gap-8 bg-gray-50 pb-32">
			<TopicHeader
				parentLink="/groups"
				parentTitle="Gruppen"
				title={group.name}
				subtitle={group.slug || ""}
			>
				<div className="absolute top-1/2 -translate-y-1/2 right-4 flex gap-2">
					<Link href={`/teaching/groups/${groupId}/edit`} className="btn-primary">
						<PencilIcon className="icon h-5" />
						<span>Bearbeiten</span>
					</Link>
					<GroupDeleteOption group={group} />
				</div>
			</TopicHeader>

			<CenteredContainerXL>
				{!group ? (
					<LoadingBox />
				) : (
					<>
						<SectionHeader
							title="Mitglieder*innen"
							subtitle="Alle Mitglieder*innen dieser Gruppe."
						/>

						<SearchField
							placeholder="Suche nach Mitglieder*in"
							onChange={e => setMemberName(e.target.value)}
						/>

						<GroupMemberTable>
							{filteredMembers.map(member => (
								<GroupMemberRow key={member.user.id} member={member} />
							))}
						</GroupMemberTable>

						<SectionHeader
							title="Berechtigungen"
							subtitle="Alle Berechtigungen dieser Gruppe."
						/>

						<SearchField
							placeholder="Suche nach Ressourcen"
							onChange={e => setResourceNameFilter(e.target.value)}
						/>

						<GroupPermissionTable>
							{filteredResources.map(p => {
								const np = ResourceAccessFormSchema.parse(p);
								return (
									<GroupPermissionRow
										permission={np}
										key={getPermKey(np)}
										onRelations={setSelectedPermission}
									/>
								);
							})}
						</GroupPermissionTable>

						{selectedPermission && (
							<GroupPermissionRelationsDialog
								permission={selectedPermission}
								onClose={handleRelationsDialogClose}
								isOpen={!!selectedPermission}
							/>
						)}
					</>
				)}
			</CenteredContainerXL>
		</div>
	);
}

export const getServerSideProps = withTranslations(["common"]);
