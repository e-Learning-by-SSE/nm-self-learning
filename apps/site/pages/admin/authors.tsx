import { PlusIcon } from "@heroicons/react/24/solid";
import { SearchUserDialog, EditAuthorDialog, UserSearchEntry } from "@self-learning/admin";
import { trpc } from "@self-learning/api-client";
import {
	Dialog,
	DialogActions,
	ImageOrPlaceholder,
	LoadingBox,
	OnDialogCloseFn,
	showToast,
	Table,
	TableDataColumn,
	TableHeaderColumn
} from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import { AdminGuard, CenteredSection, useRequiredSession } from "@self-learning/ui/layouts";
import { TRPCClientError } from "@trpc/client";
import Link from "next/link";
import { Fragment, useMemo, useState } from "react";
import { withTranslations } from "@self-learning/api";
import {
	GenericCombobox,
	GroupMemberEditor,
	GroupSearchEntry,
	MemberFormModel,
	SearchGroupDialog
} from "@self-learning/teaching";
import { GroupRole } from "@prisma/client";
import { slugify } from "@self-learning/util/common";
import { LabeledField } from "@self-learning/ui/forms";

type PromoteRequest = {
	user: UserSearchEntry;
	membership?: {
		role: GroupRole;
		expiresAt: Date | null;
		group: { id: number } | { name: string; slug: string };
	};
};

export default function AuthorsPage() {
	useRequiredSession();

	const [displayName, setDisplayName] = useState("");
	const { data: users, isLoading } = trpc.author.getAllWithGroups.useQuery();
	const [editTarget, setEditTarget] = useState<string | null>(null);
	const [createAuthorDialog, setCreateAuthorDialog] = useState(false);
	const { mutateAsync: promoteToAuthor } = trpc.admin.promoteToAuthor.useMutation();
	const filteredAuthors = useMemo(() => {
		if (!users) return [];
		if (!displayName || displayName.length === 0) return users;

		const lowerCaseDisplayName = displayName.toLowerCase().trim();
		return users.filter(user =>
			user.author?.displayName.toLowerCase().includes(lowerCaseDisplayName)
		);
	}, [displayName, users]);

	function onEdit(username: string): void {
		setEditTarget(username);
	}

	function onEditDialogClose(): void {
		setEditTarget(null);
	}

	async function onCreateAuthor(data?: PromoteRequest): Promise<void> {
		setCreateAuthorDialog(false);

		if (data) {
			try {
				await promoteToAuthor({
					username: data.user.name,
					membership: data.membership
				});
				showToast({
					type: "success",
					title: "Autor hinzugefügt",
					subtitle: data.user.displayName
				});
			} catch (error) {
				if (error instanceof TRPCClientError) {
					showToast({
						type: "error",
						title: "Fehler",
						subtitle: "Autor konnte nicht hinzugefügt werden."
					});
				}
			}
		}
	}

	return (
		<AdminGuard>
			<CenteredSection>
				<div className="mb-16 flex items-center justify-between gap-4">
					<h1 className="text-5xl">Autoren</h1>
					<button className="btn-primary" onClick={() => setCreateAuthorDialog(true)}>
						<PlusIcon className="icon h-5" />
						<span>Autor hinzufügen</span>
					</button>
					{createAuthorDialog && (
						<AddAuthorDialog isOpen={createAuthorDialog} onClose={onCreateAuthor} />
					)}
				</div>

				<SearchField
					placeholder="Suche nach Autor"
					onChange={e => setDisplayName(e.target.value)}
				/>

				{editTarget && (
					<EditAuthorDialog onClose={onEditDialogClose} username={editTarget} />
				)}

				{isLoading ? (
					<LoadingBox />
				) : (
					<Table
						head={
							<>
								<TableHeaderColumn></TableHeaderColumn>
								<TableHeaderColumn>Name</TableHeaderColumn>
								<TableHeaderColumn></TableHeaderColumn>
							</>
						}
					>
						{filteredAuthors.map(user => (
							<Fragment key={user.name}>
								{user.author && (
									<tr key={user.name}>
										<TableDataColumn>
											<ImageOrPlaceholder
												src={user.author?.imgUrl ?? undefined}
												className="m-0 h-10 w-10 rounded-lg object-cover"
											/>
										</TableDataColumn>
										<TableDataColumn>
											<div className="flex flex-wrap gap-4">
												<Link
													className="text-sm font-medium hover:text-c-primary"
													href={`/authors/${user.author.slug}`}
												>
													{user.author.displayName}
												</Link>
												<span className="flex gap-2 text-xs">
													{user.memberships.map(({ role, group }) => (
														<span
															key={group.name}
															className="rounded-full bg-c-primary px-3 py-[2px] text-white"
														>
															{group.name} - {role}
														</span>
													))}
												</span>
											</div>
										</TableDataColumn>
										<TableDataColumn>
											<div className="flex flex-wrap justify-end gap-4">
												<button
													className="btn-stroked"
													onClick={() => onEdit(user.name)}
												>
													Bearbeiten
												</button>
											</div>
										</TableDataColumn>
									</tr>
								)}
							</Fragment>
						))}
					</Table>
				)}
			</CenteredSection>
		</AdminGuard>
	);
}

export const getServerSideProps = withTranslations(["common"]);

function AddAuthorDialog({
	isOpen,
	onClose
}: {
	isOpen: boolean;
	onClose: OnDialogCloseFn<PromoteRequest>;
}) {
	const [isSearchUserOpen, setSearchUserOpen] = useState(false);
	const [isSearchGroupOpen, setSearchGroupOpen] = useState(false);
	const [doCreateNewGroup, setCreateNewGroup] = useState(false);
	const [doAddMembership, setAddMembership] = useState(false);

	const [selectedUser, setSelectedUser] = useState<UserSearchEntry | null>(null);
	const [selectedGroup, setSelectedGroup] = useState<GroupSearchEntry | null>(null);
	const [selectedMembership, setSelectedMembership] = useState<MemberFormModel | undefined>(
		undefined
	);
	const [groupName, setGroupName] = useState("");
	const [groupSlug, setGroupSlug] = useState("");

	function onUserSelected(user?: UserSearchEntry): void {
		setSelectedUser(user ?? null);
		setSearchUserOpen(false);
	}

	function onGroupSelected(group?: GroupSearchEntry): void {
		setSelectedGroup(group ?? null);
		setSearchGroupOpen(false);
	}

	function handleGroupNameChange(value: string): void {
		setGroupName(value);
		setGroupSlug(slugify(value));
	}

	function handleSubmit(): void {
		if (!selectedUser) {
			showToast({
				type: "error",
				title: "Autor nicht hinzugefügt",
				subtitle: "Kein Benutzer ausgewählt"
			});
			return;
		}

		const res: PromoteRequest = { user: selectedUser };

		if (doAddMembership || doCreateNewGroup) {
			if (!selectedMembership) {
				showToast({
					type: "error",
					title: "Autor nicht hinzugefügt",
					subtitle: "Details für neue Gruppe fehlen"
				});
				return;
			}

			let group: { id: number } | { name: string; slug: string } | null = null;

			if (doCreateNewGroup && groupName && groupSlug) {
				group = { name: groupName, slug: groupSlug };
			} else if (selectedGroup) {
				group = { id: selectedGroup.groupId };
			}

			if (!group) {
				showToast({
					type: "error",
					title: "Autor nicht hinzugefügt",
					subtitle: doCreateNewGroup
						? "Details für neue Gruppe fehlen"
						: "Keine Gruppe ausgewählt"
				});
				return;
			}

			res.membership = {
				group,
				expiresAt: selectedMembership.expiresAt,
				role: selectedMembership.role
			};
		}

		onClose(res);
	}

	return (
		<Dialog open={isOpen} onClose={onClose}>
			<div className="p-4">
				<h2 className="text-xl font-semibold mb-4">Autor hinzufügen</h2>
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium mb-2">Benutzer</label>
						{selectedUser ? (
							<div className="flex items-center gap-2 p-2 border rounded-lg">
								<ImageOrPlaceholder
									src={selectedUser.image ?? undefined}
									className="h-8 w-8 rounded-full"
								/>
								<span>{selectedUser.displayName}</span>
								<button
									className="ml-auto btn-stroked text-xs"
									onClick={() => setSearchUserOpen(true)}
								>
									Ändern
								</button>
							</div>
						) : (
							<button className="btn-primary" onClick={() => setSearchUserOpen(true)}>
								Benutzer auswählen
							</button>
						)}
					</div>
					<div className="flex items-center gap-2">
						<input
							type="checkbox"
							checked={doAddMembership}
							onChange={e => setAddMembership(e.target.checked)}
							className="checkbox"
						/>
						<label className="text-sm">Auch Gruppe hinzufügen</label>
					</div>
					{doAddMembership && (
						<>
							<div className="flex items-center gap-2">
								<input
									type="checkbox"
									checked={doCreateNewGroup}
									onChange={e => setCreateNewGroup(e.target.checked)}
									className="checkbox"
								/>
								<label className="text-sm">Neue Gruppe erstellen</label>
							</div>
							{doCreateNewGroup ? (
								<div className="space-y-2">
									<LabeledField label="Gruppenname">
										<input
											type="text"
											value={groupName}
											onChange={e => handleGroupNameChange(e.target.value)}
											className="textfield"
											placeholder="Gruppenname"
										/>
									</LabeledField>
									<LabeledField label="Slug">
										<input
											type="text"
											value={groupSlug}
											onChange={e => setGroupSlug(e.target.value)}
											className="textfield"
											placeholder="slug"
										/>
									</LabeledField>
								</div>
							) : (
								<div>
									<label className="block text-sm font-medium mb-2">Gruppe</label>
									{selectedGroup ? (
										<div className="flex items-center gap-2 p-2 border rounded">
											<span>{selectedGroup.name}</span>
											<button
												className="ml-auto btn-stroked text-xs"
												onClick={() => setSearchGroupOpen(true)}
											>
												Ändern
											</button>
										</div>
									) : (
										<button
											className="btn-primary"
											onClick={() => setSearchGroupOpen(true)}
										>
											Gruppe auswählen
										</button>
									)}
								</div>
							)}
							<GroupMemberEditor
								member={selectedMembership}
								onChange={setSelectedMembership}
							/>
						</>
					)}
					<DialogActions onClose={onClose}>
						<button className="btn-primary" onClick={handleSubmit}>
							Speichern
						</button>
					</DialogActions>
				</div>
			</div>
			{isSearchUserOpen && (
				<SearchUserDialog open={isSearchUserOpen} onClose={onUserSelected} />
			)}
			{isSearchGroupOpen && (
				<SearchGroupDialog
					isOpen={isSearchGroupOpen}
					onClose={onGroupSelected}
					isGlobalSearch={true}
				/>
			)}
		</Dialog>
	);
}
