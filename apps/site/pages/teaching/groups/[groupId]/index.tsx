import { LinkIcon, PencilIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { SearchCourseDialog, SearchUserDialog } from "@self-learning/admin";
import { trpc } from "@self-learning/api-client";
import {
	ImageOrPlaceholder,
	LoadingBox,
	OnDialogCloseFn,
	Paginator,
	SectionHeader,
	showToast,
	Table,
	TableDataColumn,
	TableHeaderColumn
} from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import {
	CenteredContainerXL,
	TopicHeader,
	Unauthorized,
	useRequiredSession
} from "@self-learning/ui/layouts";
import { TRPCClientError } from "@trpc/client";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { withTranslations } from "@self-learning/api";
import { GroupRole } from "@prisma/client";
import { formatDateString, formatTimeIntervalToString } from "@self-learning/util/common";
import { ResourceAccessFormType, ResourceAccessFormSchema } from "@self-learning/types";

function normalizePermission(perm: ResourceAccessFormType) {
	return perm.course
		? {
				type: "Kurs",
				title: perm.course.title,
				id: "c:" + perm.course.courseId,
				slug: perm.course.slug,
				accessLevel: perm.accessLevel
			}
		: {
				type: "Lerninhalt",
				title: perm.lesson!.title,
				id: "l:" + perm.lesson!.lessonId,
				slug: perm.lesson!.slug,
				accessLevel: perm.accessLevel
			};
}

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

	const { data: group } = trpc.permission.getGroup.useQuery(
		{
			id: groupId
		},
		{
			enabled: !!groupId
		}
	);

	if (group === undefined) {
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
						/>

						<div className="mb-8 flex flex-wrap gap-4">
							<button
								className="btn-stroked w-fit"
								onClick={() => setGrantGroupAccessDialog(true)}
							>
								<PlusIcon className="icon h-5" />
								<span>Mitglieder*in hinzufügen</span>
							</button>

							{grantGroupAccessDialog && (
								<SearchUserDialog
									open={grantGroupAccessDialog}
									onClose={handleGrantGroupAccess}
								/>
							)}
						</div>

						<SearchField
							placeholder="Suche nach Mitglieder*in"
							onChange={e => setMemberName(e.target.value)}
						/>

						<Table
							head={
								<>
									<TableHeaderColumn>Name</TableHeaderColumn>
									<TableHeaderColumn>Rolle</TableHeaderColumn>
									<TableHeaderColumn>Dauer</TableHeaderColumn>
									<TableHeaderColumn></TableHeaderColumn>
								</>
							}
						>
							{group.members.map(member => (
								<tr key={member.user.id}>
									<TableDataColumn>
										<span className="text-light">
											{member.user.displayName}
										</span>
									</TableDataColumn>

									<TableDataColumn>
										<span className="text-light">{member.role}</span>
									</TableDataColumn>
									<TableDataColumn>
										<span className="text-light">
											{member.expiresAt ? (
												member.expiresAt.getTime() - Date.now() < 0 ? (
													<span className="text-red-500">Abgelaufen</span>
												) : (
													formatTimeIntervalToString(
														member.expiresAt.getTime() - Date.now()
													)
												)
											) : (
												"Unbefristet"
											)}
										</span>
									</TableDataColumn>
									<TableDataColumn>
										<div className="flex justify-end">
											<button
												className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-red-500"
												title="Entziehen"
												onClick={() => {}}
												// onClick={() => handleRevokeGroupAccess(course)}
											>
												<XMarkIcon className="h-5" />
											</button>
										</div>
									</TableDataColumn>
								</tr>
							))}
						</Table>

						<SectionHeader
							title="Berechtigungen"
							subtitle="Alle Berechtigungen dieser Gruppe."
						/>

						<SearchField
							placeholder="Suche nach Ressourcen"
							onChange={e => setMemberName(e.target.value)}
						/>

						<Table
							head={
								<>
									<TableHeaderColumn>Ressource</TableHeaderColumn>
									<TableHeaderColumn>Titel</TableHeaderColumn>
									<TableHeaderColumn>Slug</TableHeaderColumn>
									<TableHeaderColumn>Zugriffsebene</TableHeaderColumn>
									<TableHeaderColumn></TableHeaderColumn>
								</>
							}
						>
							{group.permissions.map(perm => {
								const p = normalizePermission(ResourceAccessFormSchema.parse(perm));
								return (
									<tr key={p.id}>
										<TableDataColumn>
											<span className="text-light">{p.type}</span>
										</TableDataColumn>

										<TableDataColumn>
											<span className="text-light">{p.title}</span>
										</TableDataColumn>
										<TableDataColumn>
											<span className="text-light">{p.slug}</span>
										</TableDataColumn>
										<TableDataColumn>
											<span className="text-light">{p.accessLevel}</span>
										</TableDataColumn>
										<TableDataColumn>
											<div className="flex justify-end">
												<button
													className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-red-500"
													title="Entziehen"
													onClick={() => {}}
													// onClick={() => handleRevokeGroupAccess(course)}
												>
													<XMarkIcon className="h-5" />
												</button>
											</div>
										</TableDataColumn>
									</tr>
								);
							})}
						</Table>
					</>
				)}
			</CenteredContainerXL>
		</div>
	);

	return;
}

export const getServerSideProps = withTranslations(["common"]);
