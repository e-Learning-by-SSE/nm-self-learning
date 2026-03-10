"use client";
import { Combobox, ComboboxOption } from "@headlessui/react";
import { PlusIcon } from "@heroicons/react/24/solid";
import { SearchUserDialog, UserSearchEntry } from "@self-learning/admin";
import { trpc } from "@self-learning/api-client";
import {
	Chip,
	DropdownDialog,
	IconTextButton,
	OnDialogCloseFn,
	Paginator
} from "@self-learning/ui/common";
import { keepPreviousData } from "@tanstack/react-query";
import { Fragment, useState } from "react";

export type GroupSearchEntry = {
	groupId: number;
	name: string;
	slug: string | null;
	members: string[];
};

export function SearchGroupDialog({
	isOpen,
	isGlobalSearch,
	exclude,
	onClose
}: {
	isOpen: boolean;
	isGlobalSearch: boolean;
	exclude?: number[];
	onClose: OnDialogCloseFn<GroupSearchEntry>;
}) {
	const [filterName, setFilterName] = useState("");
	// const [filterSlug, setFilterSlug] = useState("");
	const [page, setPage] = useState(1);
	const [addMemberDialog, setMemberDialog] = useState(false);
	const [selectedUsers, setSelectedUsers] = useState<UserSearchEntry[]>([]);
	const members = selectedUsers.map(u => u.id);

	function onAddMember(user?: UserSearchEntry): void {
		setMemberDialog(false);

		if (user && !selectedUsers.find(u => u.id === user.id)) {
			setSelectedUsers(prev => [...prev, user]);
		}
	}

	function onRemoveMember(userId: string): void {
		setSelectedUsers(prev => prev.filter(u => u.id !== userId));
	}

	const { data: groups } = trpc.permission.findGroups.useQuery(
		{
			page,
			name: filterName,
			members,
			exclude,
			isGlobal: isGlobalSearch
		},
		{
			staleTime: 10_000,
			placeholderData: keepPreviousData
		}
	);

	return (
		<DropdownDialog.Dialog open={isOpen} onClose={onClose}>
			<Combobox value={null}>
				{isGlobalSearch && (
					<DropdownDialog.SearchInput
						filter={filterName}
						setFilter={setFilterName}
						placeholder="Suche nach Gruppe"
					/>
				)}
				<div className="mt-4 flex items-center flex-wrap gap-2 px-4">
					{selectedUsers.map(user => (
						<Chip
							key={user.id}
							onRemove={() => onRemoveMember(user.id)}
							displayImage={false}
							// imgUrl={user.image}
						>
							{user.displayName}
							<span className="text-sm text-light">{user.email}</span>
						</Chip>
					))}
					<IconTextButton
						icon={<PlusIcon className="icon h-5" />}
						text={"Add member to search"}
						className="btn-primary"
						title="Add member to search1"
						onClick={() => setMemberDialog(true)}
					/>
					{addMemberDialog && (
						<SearchUserDialog open={addMemberDialog} onClose={onAddMember} />
					)}
				</div>

				<DropdownDialog.PaginationContainer>
					{groups && <Paginator pagination={groups} url="#" onPageChange={setPage} />}
				</DropdownDialog.PaginationContainer>

				<DropdownDialog.Options>
					{groups?.result.map(group => (
						<ComboboxOption value={group} key={group.groupId} as={Fragment}>
							{({ focus }) => (
								<button
									type="button"
									onClick={() => onClose(group)}
									data-testid="course-option"
									className={`flex items-center gap-4 rounded px-4 py-2 ${
										focus ? "bg-secondary text-white" : ""
									}`}
								>
									<div className="flex-1 text-left">
										<span className="text-light">{group.name}</span>
									</div>
									<div className="flex-1 text-left">
										<span className="text-light">{group.members.length}</span>
									</div>
								</button>
							)}
						</ComboboxOption>
					))}
				</DropdownDialog.Options>
			</Combobox>
		</DropdownDialog.Dialog>
	);
}

// if user has single membership, fetches the group
export function useSingleMembership({
	userGroups,
	enabled: shouldFetch = false
}: {
	userGroups?: number[];
	enabled?: boolean;
}): GroupSearchEntry | null {
	const hasSingleGroup = userGroups?.length === 1;
	const groupId = userGroups?.[0];
	const enabled = hasSingleGroup && shouldFetch;
	const query = trpc.permission.getGroup.useQuery({ id: groupId ?? 0 }, { enabled });

	return enabled && query.data
		? {
				groupId: query.data.id,
				name: query.data.name,
				members: query.data.members.map(m => m.user.displayName),
				slug: query.data.slug
			}
		: null;
}
